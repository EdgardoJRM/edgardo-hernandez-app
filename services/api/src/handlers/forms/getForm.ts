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
      return errorResponse('El formId es requerido', 400);
    }

    const form = await getFormById(formId);
    if (!form) {
      return errorResponse('Formulario no encontrado', 404);
    }

    if (!form.isActive) {
      return errorResponse('El formulario no está activo', 400);
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
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getForm:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

