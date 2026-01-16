import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest } from '../../utils/auth';
import { getFormById } from '../../models/form';
import { createSubmission } from '../../models/submission';
import { runEngine } from '../../engines';

const requestSchema = z.object({
  answers: z.record(z.any()),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = authenticateRequest(event);

    const formId = event.pathParameters?.formId;
    if (!formId) {
      return errorResponse('El formId es requerido', 400);
    }

    if (!event.body) {
      return errorResponse('El cuerpo de la solicitud es requerido', 400);
    }

    const body = JSON.parse(event.body);
    const validated = requestSchema.parse(body);

    // Get form
    const form = await getFormById(formId);
    if (!form || !form.isActive) {
      return errorResponse('Formulario no encontrado o no activo', 404);
    }

    // Basic validation against form definition
    // (More sophisticated validation can be added)

    // Run engine to calculate result
    const result = await runEngine(formId, validated.answers);

    // Save submission
    const submission = await createSubmission(
      authEvent.userId,
      formId,
      validated.answers,
      result
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        successResponse({
          submissionId: submission.submissionId,
          result,
        })
      ),
    };
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    console.error('Error in submitForm:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

