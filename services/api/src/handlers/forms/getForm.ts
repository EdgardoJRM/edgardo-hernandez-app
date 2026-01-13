import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest } from '../../utils/auth';
import { getFormById } from '../../models/form';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    authenticateRequest(event);

    const formId = event.pathParameters?.formId;
    if (!formId) {
      return errorResponse('formId is required', 400);
    }

    const form = await getFormById(formId);
    if (!form) {
      return errorResponse('Form not found', 404);
    }

    if (!form.isActive) {
      return errorResponse('Form is not active', 400);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        successResponse({
          formId: form.formId,
          title: form.title,
          version: form.version,
          definitionJSON: form.definitionJSON,
        })
      ),
    };
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getForm:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

