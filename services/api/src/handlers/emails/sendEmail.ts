import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { createEmailLog, updateEmailLogStatus } from '../../models/emailLog';
import { sendEmail } from '../../utils/email';

const requestSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  templateId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
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

    const fromEmail = process.env.SES_FROM_EMAIL || 'soporte@edgardohernandez.com';

    // Crear log de email
    const emailLog = await createEmailLog({
      to: validated.to,
      from: fromEmail,
      subject: validated.subject,
      body: validated.body,
      status: 'pending',
      userId: authEvent.userId,
      templateId: validated.templateId,
      metadata: validated.metadata,
    });

    try {
      // Enviar email
      await sendEmail(validated.to, validated.subject, validated.body);
      
      // Actualizar log como enviado
      await updateEmailLogStatus(emailLog.emailLogId, 'sent', Date.now());
      
      return successResponse({ ...emailLog, status: 'sent', sentAt: Date.now() });
    } catch (emailError: any) {
      // Actualizar log como fallido
      await updateEmailLogStatus(emailLog.emailLogId, 'failed', undefined, emailError.message);
      throw emailError;
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in sendEmail:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

