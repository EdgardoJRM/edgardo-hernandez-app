import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { getRegistrationByTicketCode, checkInRegistration, getEventById } from '../../models/eventRegistration';
import { getEventById as getEvent } from '../../models/event';

const requestSchema = z.object({
  ticketCode: z.string().min(1),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);
    requireRole(authEvent, ['employee', 'admin']);

    if (!event.body) {
      return errorResponse('El cuerpo de la solicitud es requerido', 400);
    }

    const body = JSON.parse(event.body);
    const validated = requestSchema.parse(body);

    // Buscar registro por código de ticket
    const registration = await getRegistrationByTicketCode(validated.ticketCode);
    if (!registration) {
      return errorResponse('Código de entrada no encontrado', 404);
    }

    // Verificar que no esté ya registrado
    if (registration.status === 'checked_in') {
      const eventData = await getEventById(registration.eventId);
      return successResponse({
        registration,
        event: eventData,
        message: 'Ya fue registrado anteriormente',
        alreadyCheckedIn: true,
      });
    }

    if (registration.status === 'cancelled') {
      return errorResponse('Esta entrada ha sido cancelada', 400);
    }

    // Hacer check-in
    const updatedRegistration = await checkInRegistration(registration.registrationId, authEvent.userId);

    // Obtener información del evento
    const eventData = await getEventById(registration.eventId);

    return successResponse({
      registration: updatedRegistration,
      event: eventData,
      message: 'Check-in realizado exitosamente',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    if (error.message === 'No tienes permisos para acceder a este recurso') {
      return errorResponse(error.message, 403);
    }
    console.error('Error in checkInTicket:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

