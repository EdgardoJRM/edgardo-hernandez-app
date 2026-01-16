import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { checkRateLimit } from '../../utils/rateLimit';
import { createChallenge } from '../../models/authChallenge';
import { generateOtp, generateToken, hashOtp } from '../../utils/crypto';
import { sendCombinedAuthEmail } from '../../utils/email';

const requestSchema = z.object({
  email: z.string().email(),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    const { handleOptionsRequest } = await import('../../utils/response');
    return handleOptionsRequest();
  }

  try {
    if (!event.body) {
      return errorResponse('El cuerpo de la solicitud es requerido', 400);
    }

    const body = JSON.parse(event.body);
    const validated = requestSchema.parse(body);

    const email = validated.email.toLowerCase().trim();

    // Rate limiting
    const clientIp = event.requestContext.identity?.sourceIp || 'unknown';
    const rateLimitKey = `${email}_${clientIp}`;
    const canProceed = await checkRateLimit(rateLimitKey, 5, 10);
    if (!canProceed) {
      return errorResponse('Demasiadas solicitudes. Por favor intenta más tarde.', 429);
    }

    // Generate both OTP and Magic Link
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const token = generateToken();
    const tokenHash = await hashOtp(token);

    // Create both challenges
    await createChallenge(email, 'otp', otpHash, 10, clientIp);
    await createChallenge(email, 'magic_link', tokenHash, 15, clientIp);

    // Send combined email with both methods
    await sendCombinedAuthEmail(email, otp, token);

    return successResponse({ message: 'sent' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    console.error('Error in auth/start:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

