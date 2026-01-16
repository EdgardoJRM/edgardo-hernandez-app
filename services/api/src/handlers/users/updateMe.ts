import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest } from '../../utils/auth';
import { updateUser } from '../../models/user';

const requestSchema = z.object({
  name: z.string().optional(),
  business: z.string().optional(),
  industry: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = authenticateRequest(event);

    if (!event.body) {
      return errorResponse('El cuerpo de la solicitud es requerido', 400);
    }

    const body = JSON.parse(event.body);
    const validated = requestSchema.parse(body);

    const updatedUser = await updateUser(authEvent.userId, validated);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        successResponse({
          userId: updatedUser.userId,
          email: updatedUser.email,
          name: updatedUser.name,
          business: updatedUser.business,
          industry: updatedUser.industry,
          tags: updatedUser.tags,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        })
      ),
    };
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    console.error('Error in updateMe:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

