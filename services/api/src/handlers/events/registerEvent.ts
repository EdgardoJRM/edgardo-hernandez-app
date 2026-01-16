import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest } from '../../utils/auth';
import { getEventById } from '../../models/event';
import { createRegistration, getRegistrationsByEvent } from '../../models/eventRegistration';
import { generateTicketCode, sendEventTicketEmail } from '../../utils/eventTickets';

const requestSchema = z.object({
  eventId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);

    if (!event.body) {
      return errorResponse('El cuerpo de la solicitud es requerido', 400);
    }

    const body = JSON.parse(event.body);
    const validated = requestSchema.parse(body);

    // Verificar que el evento existe y está publicado
    const eventData = await getEventById(validated.eventId);
    if (!eventData) {
      return errorResponse('Evento no encontrado', 404);
    }

    if (eventData.status !== 'published') {
      return errorResponse('El evento no está disponible para registro', 400);
    }

    // Verificar capacidad
    if (eventData.capacity) {
      const existingRegistrations = await getRegistrationsByEvent(validated.eventId);
      const confirmedCount = existingRegistrations.filter(r => r.status === 'confirmed' || r.status === 'checked_in').length;
      if (confirmedCount >= eventData.capacity) {
        return errorResponse('El evento está lleno', 400);
      }
    }

    // Generar código único de ticket
    const ticketCode = generateTicketCode();

    // Crear registro
    const registration = await createRegistration({
      eventId: validated.eventId,
      userId: authEvent.userId,
      email: validated.email,
      name: validated.name,
      phone: validated.phone,
      ticketCode,
      status: 'confirmed',
      paymentStatus: eventData.price && eventData.price > 0 ? 'pending' : undefined,
    });

    // Enviar email con la entrada
    try {
      await sendEventTicketEmail(validated.email, validated.name, eventData, ticketCode);
    } catch (emailError) {
      console.error('Error sending ticket email:', emailError);
      // No fallar el registro si el email falla
    }

    return successResponse(registration);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in registerEvent:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

