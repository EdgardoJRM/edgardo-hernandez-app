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
    const token = validated.token.trim();

    console.log('Exchange magic request:', { 
      email, 
      tokenLength: token.length, 
      tokenPrefix: token.substring(0, 10),
      tokenSuffix: token.substring(token.length - 10),
      tokenFull: token, // Log completo para debugging
      tokenIsHex: /^[0-9a-f]{64}$/i.test(token),
    });

    // Find valid challenge
    const challenge = await findValidChallenge(email, 'magic_link');
    if (!challenge) {
      console.error('Challenge not found for email:', email);
      return errorResponse('Enlace inválido o expirado. Por favor solicita un nuevo enlace de acceso.', 400);
    }

    console.log('Challenge found:', { 
      challengeId: challenge.challengeId, 
      createdAt: challenge.createdAt,
      expiresAt: challenge.expiresAt,
      expiresIn: challenge.expiresAt - Math.floor(Date.now() / 1000),
      hasTokenHash: !!challenge.tokenHash,
      tokenHashPrefix: challenge.tokenHash?.substring(0, 20),
    });

    // Verify token
    if (!challenge.tokenHash) {
      return errorResponse('Desafío inválido', 400);
    }

    // Log antes de verificar para debugging
    console.log('Verifying token:', {
      receivedTokenLength: token.length,
      receivedTokenPrefix: token.substring(0, 10),
      receivedTokenSuffix: token.substring(token.length - 10),
      receivedTokenFull: token, // Log completo del token recibido
      hashPrefix: challenge.tokenHash.substring(0, 20),
      hashLength: challenge.tokenHash.length,
    });

    // Verificar que el token tenga la longitud correcta (64 caracteres hex)
    if (token.length !== 64) {
      console.error('Token length mismatch:', { 
        expected: 64, 
        actual: token.length,
        token: token,
      });
      return errorResponse('Token inválido: longitud incorrecta.', 400);
    }

    // Verificar que el token solo contenga caracteres hexadecimales
    if (!/^[0-9a-f]{64}$/i.test(token)) {
      console.error('Token format invalid - not hexadecimal:', { 
        token: token,
        tokenLength: token.length,
      });
      return errorResponse('Token inválido: formato incorrecto.', 400);
    }

    const isValid = await verifyOtp(token, challenge.tokenHash);
    if (!isValid) {
      console.error('Token verification failed:', { 
        tokenLength: token.length, 
        tokenPrefix: token.substring(0, 10),
        tokenSuffix: token.substring(token.length - 10),
        tokenFull: token, // Log completo del token recibido
        hasTokenHash: !!challenge.tokenHash,
        challengeId: challenge.challengeId,
        createdAt: challenge.createdAt,
        expiresAt: challenge.expiresAt,
      });
      
      // Intentar verificar con el token sin trim por si acaso
      const untrimmedToken = validated.token;
      if (untrimmedToken !== token) {
        console.log('Token differs after trim, trying untrimmed:', { 
          trimmed: token, 
          untrimmed: untrimmedToken,
          trimmedLength: token.length,
          untrimmedLength: untrimmedToken.length,
        });
        const isValidUntrimmed = await verifyOtp(untrimmedToken, challenge.tokenHash);
        console.log('Retry with untrimmed token result:', { isValidUntrimmed });
        if (isValidUntrimmed) {
          // Si funciona sin trim, usar ese token
          console.log('Token verification succeeded with untrimmed token');
        } else {
          return errorResponse('Token inválido. Este enlace puede ser de un email anterior. Por favor solicita un nuevo enlace.', 400);
        }
      } else {
        return errorResponse('Token inválido. Este enlace puede ser de un email anterior. Por favor solicita un nuevo enlace.', 400);
      }
    } else {
      console.log('Token verification succeeded');
    }

    console.log('Token verified successfully');

    // Mark challenge as consumed (one-time use) - DESPUÉS de verificar
    await markChallengeConsumed(challenge.challengeId);
    console.log('Challenge marked as consumed:', challenge.challengeId);

    // Get or create user
    let user = await getOrCreateUser(email);
    console.log('User retrieved/created:', { userId: user.userId, email: user.email });

    // Verificar y sincronizar con ClickFunnels (no bloquear si falla)
    let clickfunnelsData;
    try {
      clickfunnelsData = await getClickFunnelsContact(email);
    } catch (cfError: any) {
      console.warn('Error fetching ClickFunnels contact (non-blocking):', cfError.message);
      clickfunnelsData = { contact: null };
    }
    
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

    console.log('JWT generated successfully for user:', user.userId);

    const responseData = {
      token: tokenJWT,
          user: {
            userId: user.userId,
            email: user.email,
            name: user.name,
            business: user.business,
            industry: user.industry,
            tags: user.tags,
            role: user.role,
            clickfunnelsId: user.clickfunnelsId,
            clickfunnelsStatus: user.clickfunnelsStatus,
            clickfunnelsTags: user.clickfunnelsTags,
          },
    };

    console.log('Returning response with token length:', tokenJWT.length);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(successResponse(responseData)),
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    console.error('Error in auth/exchange-magic:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

