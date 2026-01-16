import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { createEvent } from '../../models/event';

const requestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['event', 'workshop', 'seminar', 'conference']),
  startDate: z.number(),
  endDate: z.number(),
  location: z.string().optional(),
  locationUrl: z.string().url().optional(),
  capacity: z.number().optional(),
  price: z.number().optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  clickfunnelsProductId: z.string().optional(), // ID del producto en ClickFunnels
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

    const newEvent = await createEvent({
      ...validated,
      createdBy: authEvent.userId,
    });

    return successResponse(newEvent);
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
    console.error('Error in createEvent:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

