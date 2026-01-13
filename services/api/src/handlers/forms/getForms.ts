import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest } from '../../utils/auth';
import { getAllForms } from '../../models/form';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    authenticateRequest(event); // Just verify auth, don't need user data

    const forms = await getAllForms();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        successResponse(
          forms.map(form => ({
            formId: form.formId,
            title: form.title,
            version: form.version,
            isActive: form.isActive,
          }))
        )
      ),
    };
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getForms:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

