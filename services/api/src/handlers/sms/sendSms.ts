import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { createSmsLog, updateSmsLogStatus } from '../../models/smsLog';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const requestSchema = z.object({
  to: z.string().min(10), // Número de teléfono
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);
    requireRole(authEvent, ['employee', 'admin']);

    if (!event.body) {
      return errorResponse('El cuerpo de la solicitud es requerido', 400);
    }

    const body = JSON.parse(event.body);
    const validated = requestSchema.parse(body);

    // Crear log de SMS
    const smsLog = await createSmsLog({
      to: validated.to,
      message: validated.message,
      status: 'pending',
      userId: authEvent.userId,
      metadata: validated.metadata,
    });

    try {
      // Enviar SMS usando SNS
      const command = new PublishCommand({
        PhoneNumber: validated.to,
        Message: validated.message,
      });

      const result = await snsClient.send(command);
      
      // Actualizar log como enviado
      await updateSmsLogStatus(smsLog.smsLogId, 'sent', Date.now());
      
      return successResponse({ 
        ...smsLog, 
        status: 'sent', 
        sentAt: Date.now(),
        messageId: result.MessageId 
      });
    } catch (smsError: any) {
      // Actualizar log como fallido
      await updateSmsLogStatus(smsLog.smsLogId, 'failed', undefined, undefined, smsError.message);
      throw smsError;
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in sendSms:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

