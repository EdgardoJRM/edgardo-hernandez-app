import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest } from '../../utils/auth';
import { createAttendance } from '../../models/attendance';
import { getUserById } from '../../models/user';
import { v4 as uuidv4 } from 'uuid';

const requestSchema = z.object({
  qrCode: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
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

    const user = await getUserById(authEvent.userId);
    if (!user) {
      return errorResponse('Usuario no encontrado', 404);
    }

    // Si no se proporciona QR code, generar uno único para el usuario
    const qrCode = validated.qrCode || `${user.userId}-${uuidv4()}`;

    const attendance = await createAttendance({
      userId: authEvent.userId,
      qrCode,
      checkInTime: Date.now(),
      location: validated.location,
      notes: validated.notes,
    });

    return successResponse(attendance);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in checkIn:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

