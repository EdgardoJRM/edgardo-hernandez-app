import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { updateMaterial, getMaterialById } from '../../models/material';

const requestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().min(0).optional(),
  unit: z.string().optional(),
  location: z.string().optional(),
  supplier: z.string().optional(),
  cost: z.number().optional(),
  status: z.enum(['available', 'low_stock', 'out_of_stock', 'reserved']).optional(),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);
    requireRole(authEvent, ['employee', 'admin']);

    if (!event.pathParameters?.materialId) {
      return errorResponse('materialId es requerido', 400);
    }

    if (!event.body) {
      return errorResponse('El cuerpo de la solicitud es requerido', 400);
    }

    const materialId = event.pathParameters.materialId;
    const existingMaterial = await getMaterialById(materialId);
    if (!existingMaterial) {
      return errorResponse('Material no encontrado', 404);
    }

    const body = JSON.parse(event.body);
    const validated = requestSchema.parse(body);

    const material = await updateMaterial(materialId, validated);

    return successResponse(material);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in updateMaterial:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

