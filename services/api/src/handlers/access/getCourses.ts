import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { getClickFunnelsCourses } from '../../utils/clickfunnels';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);
    requireRole(authEvent, ['employee', 'admin']);

    const courses = await getClickFunnelsCourses();

    return successResponse(courses);
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    if (error.message === 'No tienes permisos para acceder a este recurso') {
      return errorResponse(error.message, 403);
    }
    console.error('Error in getCourses:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

