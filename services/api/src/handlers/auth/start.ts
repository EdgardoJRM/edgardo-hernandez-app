import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse, handleOptionsRequest } from '../../utils/response';
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
    return handleOptionsRequest();
  }

  try {
    if (!event.body) {
      return errorResponse('El cuerpo de la solicitud es requerido', 400);
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      return errorResponse('JSON inválido en el cuerpo de la solicitud', 400);
    }

    const validated = requestSchema.parse(body);
    const email = validated.email.toLowerCase().trim();

    // Rate limiting - obtener IP de forma segura
    let clientIp = 'unknown';
    try {
      if (event.requestContext) {
        if (event.requestContext.identity && event.requestContext.identity.sourceIp) {
          clientIp = event.requestContext.identity.sourceIp;
        } else if ((event.requestContext as any).http && (event.requestContext as any).http.sourceIp) {
          clientIp = (event.requestContext as any).http.sourceIp;
        }
      }
    } catch (ipError) {
      console.warn('Error obteniendo IP:', ipError);
      // Continuar con 'unknown'
    }

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

    console.log('Generated auth tokens:', {
      email,
      otpLength: otp.length,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 10)
    });

    // Create both challenges
    const otpChallenge = await createChallenge(email, 'otp', otpHash, 10, clientIp);
    const magicChallenge = await createChallenge(email, 'magic_link', tokenHash, 15, clientIp);

    console.log('Challenges created:', {
      otpChallengeId: otpChallenge.challengeId,
      magicChallengeId: magicChallenge.challengeId,
      otpExpiresAt: otpChallenge.expiresAt,
      magicExpiresAt: magicChallenge.expiresAt
    });

    // Send combined email with both methods
    await sendCombinedAuthEmail(email, otp, token);

    console.log('Email sent successfully to:', email);

    return successResponse({ message: 'sent' });
  } catch (error: any) {
    console.error('Error in auth/start:', error);
    console.error('Error stack:', error.stack);
    
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    
    // Asegurar que siempre devolvemos una respuesta válida con CORS
    return errorResponse(error?.message || 'Error interno del servidor', 500);
  }
};

