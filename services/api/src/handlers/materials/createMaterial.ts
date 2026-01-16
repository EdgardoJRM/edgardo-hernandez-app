import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest } from '../../utils/auth';
import { createMaterial } from '../../models/material';

const requestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().min(0),
  unit: z.string().optional(),
  location: z.string().optional(),
  supplier: z.string().optional(),
  cost: z.number().optional(),
  status: z.enum(['available', 'low_stock', 'out_of_stock', 'reserved']).default('available'),
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

    const material = await createMaterial({
      ...validated,
      createdBy: authEvent.userId,
    });

    return successResponse(material);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in createMaterial:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

