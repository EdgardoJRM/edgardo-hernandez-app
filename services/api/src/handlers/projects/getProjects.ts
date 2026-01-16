import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { getAllProjects, getProjectsByUser } from '../../models/project';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);
    requireRole(authEvent, ['employee', 'admin']);

    // Si se especifica userId en query params, obtener proyectos de ese usuario
    // Si no, obtener todos los proyectos
    const userId = event.queryStringParameters?.userId;
    const projects = userId
      ? await getProjectsByUser(userId)
      : await getAllProjects();

    return successResponse(projects);
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getProjects:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

