import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { grantAccess } from '../../models/access';
import { getUserByEmail } from '../../models/user';
import { getMaterialById } from '../../models/material';
import { grantCourseAccess } from '../../utils/clickfunnels';
import { AccessType } from '../../models/access';

const requestSchema = z.object({
  userEmail: z.string().email(),
  accessType: z.enum(['material', 'course', 'event', 'resource']),
  resourceId: z.string().min(1),
  resourceName: z.string().optional(),
  clickfunnelsCourseId: z.string().optional(),
  expiresAt: z.number().optional(),
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

    // Buscar usuario por email
    const user = await getUserByEmail(validated.userEmail);
    if (!user) {
      return errorResponse('Usuario no encontrado', 404);
    }

    // Si es acceso a material, verificar que existe
    if (validated.accessType === 'material') {
      const material = await getMaterialById(validated.resourceId);
      if (!material) {
        return errorResponse('Material no encontrado', 404);
      }
    }

    // Si es acceso a curso de ClickFunnels, dar acceso en ClickFunnels
    if (validated.accessType === 'course' && validated.clickfunnelsCourseId) {
      const cfResult = await grantCourseAccess(validated.userEmail, validated.clickfunnelsCourseId);
      if (!cfResult.success) {
        return errorResponse(`Error al dar acceso en ClickFunnels: ${cfResult.error}`, 400);
      }
    }

    // Crear registro de acceso
    const access = await grantAccess({
      userId: user.userId,
      accessType: validated.accessType as AccessType,
      resourceId: validated.resourceId,
      resourceName: validated.resourceName,
      clickfunnelsCourseId: validated.clickfunnelsCourseId,
      grantedBy: authEvent.userId,
      grantedAt: Date.now(),
      expiresAt: validated.expiresAt,
    });

    return successResponse(access);
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
    console.error('Error in grantAccess:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

