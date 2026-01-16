import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest } from '../../utils/auth';
import { getSubmissionById } from '../../models/submission';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = authenticateRequest(event);

    const submissionId = event.pathParameters?.submissionId;
    if (!submissionId) {
      return errorResponse('El submissionId es requerido', 400);
    }

    const submission = await getSubmissionById(submissionId);
    if (!submission) {
      return errorResponse('Respuesta no encontrada', 404);
    }

    // Verify ownership
    if (submission.userId !== authEvent.userId) {
      return errorResponse('No autorizado', 403);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        successResponse({
          submissionId: submission.submissionId,
          formId: submission.formId,
          answersJSON: submission.answersJSON,
          resultJSON: submission.resultJSON,
          createdAt: submission.createdAt,
        })
      ),
    };
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getSubmission:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

