import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest } from '../../utils/auth';
import { getUserAccess } from '../../models/access';
import { AccessType } from '../../models/access';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);

    // Si se especifica userId en query, verificar que sea el mismo usuario o empleado
    const requestedUserId = event.queryStringParameters?.userId || authEvent.userId;
    const accessType = event.queryStringParameters?.accessType as AccessType | undefined;

    if (requestedUserId !== authEvent.userId && authEvent.userRole !== 'employee' && authEvent.userRole !== 'admin') {
      return errorResponse('No tienes permisos para ver los accesos de otros usuarios', 403);
    }

    const accesses = await getUserAccess(requestedUserId, accessType);

    return successResponse(accesses);
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getUserAccess:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

