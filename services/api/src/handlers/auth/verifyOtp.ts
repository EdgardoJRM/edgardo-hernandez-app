import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { findValidChallenge, markChallengeConsumed, incrementChallengeAttempts, isMaxAttemptsReached } from '../../models/authChallenge';
import { verifyOtp } from '../../utils/crypto';
import { getOrCreateUser, updateUser } from '../../models/user';
import { signToken } from '../../utils/jwt';
import { getClickFunnelsContact } from '../../utils/clickfunnels';

const requestSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return errorResponse('El cuerpo de la solicitud es requerido', 400);
    }

    const body = JSON.parse(event.body);
    const validated = requestSchema.parse(body);

    const email = validated.email.toLowerCase().trim();
    const code = validated.code;

    // Find valid challenge
    const challenge = await findValidChallenge(email, 'otp');
    if (!challenge) {
      return errorResponse('Código inválido o expirado', 400);
    }

    // Check attempts
    if (isMaxAttemptsReached(challenge.attempts)) {
      return errorResponse('Se alcanzó el máximo de intentos. Por favor solicita un nuevo código.', 400);
    }

    // Verify OTP
    if (!challenge.otpHash) {
      return errorResponse('Desafío inválido', 400);
    }

    const isValid = await verifyOtp(code, challenge.otpHash);
    if (!isValid) {
      // Increment attempts
      const newAttempts = await incrementChallengeAttempts(challenge.challengeId);
      if (isMaxAttemptsReached(newAttempts)) {
        return errorResponse('Se alcanzó el máximo de intentos. Por favor solicita un nuevo código.', 400);
      }
      return errorResponse('Código inválido', 400);
    }

    // Mark challenge as consumed
    await markChallengeConsumed(challenge.challengeId);

    // Get or create user
    let user = await getOrCreateUser(email);

    // Verificar y sincronizar con ClickFunnels
    const clickfunnelsData = await getClickFunnelsContact(email);
    if (clickfunnelsData.contact) {
      const cfContact = clickfunnelsData.contact;
      const updates: any = {};
      
      if (cfContact.id) updates.clickfunnelsId = cfContact.id;
      if (cfContact.status) updates.clickfunnelsStatus = cfContact.status;
      if (cfContact.tags && cfContact.tags.length > 0) {
        updates.clickfunnelsTags = cfContact.tags;
        // También actualizamos los tags del usuario si no tiene
        if (!user.tags || user.tags.length === 0) {
          updates.tags = cfContact.tags;
        }
        // Si tiene el tag "employee" o "empleado", asignar rol de empleado
        const employeeTags = ['employee', 'empleado', 'staff', 'team'];
        const hasEmployeeTag = cfContact.tags.some((tag: string) => 
          employeeTags.includes(tag.toLowerCase())
        );
        if (hasEmployeeTag && (!user.role || user.role === 'user')) {
          updates.role = 'employee';
        }
      }
      if (cfContact.firstName && !user.name) {
        updates.name = cfContact.firstName + (cfContact.lastName ? ` ${cfContact.lastName}` : '');
      }
      if (cfContact.customFields) {
        updates.clickfunnelsData = cfContact.customFields;
      }

      if (Object.keys(updates).length > 0) {
        user = await updateUser(user.userId, updates);
      }
    }

    // Generate JWT
    const token = signToken({
      userId: user.userId,
      email: user.email,
    });

    return successResponse({
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        business: user.business,
        industry: user.industry,
        tags: user.tags,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    console.error('Error in auth/verify-otp:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

