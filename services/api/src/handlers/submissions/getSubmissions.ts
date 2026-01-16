import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest } from '../../utils/auth';
import { getSubmissionsByUserId } from '../../models/submission';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = authenticateRequest(event);

    const submissions = await getSubmissionsByUserId(authEvent.userId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        successResponse(
          submissions.map(sub => ({
            submissionId: sub.submissionId,
            formId: sub.formId,
            createdAt: sub.createdAt,
          }))
        )
      ),
    };
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getSubmissions:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

