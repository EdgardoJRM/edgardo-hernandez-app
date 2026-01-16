import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse, handleOptionsRequest } from '../../utils/response';
import { findValidChallenge, markChallengeConsumed } from '../../models/authChallenge';
import { verifyOtp } from '../../utils/crypto';
import { getOrCreateUser, updateUser } from '../../models/user';
import { signToken } from '../../utils/jwt';
import { getClickFunnelsContact } from '../../utils/clickfunnels';

const requestSchema = z.object({
  email: z.string().email(),
  token: z.string(),
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
    const token = validated.token;

    // Find valid challenge
    const challenge = await findValidChallenge(email, 'magic_link');
    if (!challenge) {
      return errorResponse('Enlace inválido o expirado', 400);
    }

    // Verify token
    if (!challenge.tokenHash) {
      return errorResponse('Desafío inválido', 400);
    }

    const isValid = await verifyOtp(token, challenge.tokenHash);
    if (!isValid) {
      return errorResponse('Token inválido', 400);
    }

    // Mark challenge as consumed (one-time use)
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
    const tokenJWT = signToken({
      userId: user.userId,
      email: user.email,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        successResponse({
          token: tokenJWT,
          user: {
            userId: user.userId,
            email: user.email,
            name: user.name,
            business: user.business,
            industry: user.industry,
            tags: user.tags,
          },
        })
      ),
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    console.error('Error in auth/exchange-magic:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

