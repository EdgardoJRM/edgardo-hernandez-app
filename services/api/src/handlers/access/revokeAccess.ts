import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { revokeUserAccess, getAccessById, revokeAccess } from '../../models/access';
import { getUserByEmail, getUserById } from '../../models/user';
import { revokeCourseAccess } from '../../utils/clickfunnels';
import { AccessType } from '../../models/access';

const requestSchema = z.object({
  accessId: z.string().optional(),
  userEmail: z.string().email().optional(),
  resourceId: z.string().optional(),
  accessType: z.enum(['material', 'course', 'event', 'resource']).optional(),
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

    // Si se proporciona accessId, revocar directamente
    if (validated.accessId) {
      const access = await getAccessById(validated.accessId);
      if (!access) {
        return errorResponse('Acceso no encontrado', 404);
      }

      // Si es curso de ClickFunnels, revocar también allí
      if (access.accessType === 'course' && access.clickfunnelsCourseId) {
        const user = await getUserById(access.userId);
        if (user) {
          await revokeCourseAccess(user.email, access.clickfunnelsCourseId);
        }
      }

      await revokeAccess(validated.accessId);
      return successResponse({ message: 'Acceso revocado correctamente' });
    }

    // Si se proporciona userEmail y resourceId, buscar y revocar
    if (validated.userEmail && validated.resourceId && validated.accessType) {
      const user = await getUserByEmail(validated.userEmail);
      if (!user) {
        return errorResponse('Usuario no encontrado', 404);
      }

      // Si es curso de ClickFunnels, revocar también allí
      if (validated.accessType === 'course') {
        await revokeCourseAccess(validated.userEmail, validated.resourceId);
      }

      await revokeUserAccess(user.userId, validated.resourceId, validated.accessType as AccessType);
      return successResponse({ message: 'Acceso revocado correctamente' });
    }

    return errorResponse('Debes proporcionar accessId o (userEmail, resourceId, accessType)', 400);
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
    console.error('Error in revokeAccess:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

