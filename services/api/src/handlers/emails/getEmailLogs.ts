import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { getAllEmailLogs, getEmailLogsByUser, getEmailLogsByRecipient } from '../../models/emailLog';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);
    requireRole(authEvent, ['employee', 'admin']);

    const userId = event.queryStringParameters?.userId;
    const recipient = event.queryStringParameters?.recipient;
    const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : 100;

    let logs;
    if (userId) {
      logs = await getEmailLogsByUser(userId);
    } else if (recipient) {
      logs = await getEmailLogsByRecipient(recipient, limit);
    } else {
      logs = await getAllEmailLogs(limit);
    }

    return successResponse(logs);
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getEmailLogs:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

