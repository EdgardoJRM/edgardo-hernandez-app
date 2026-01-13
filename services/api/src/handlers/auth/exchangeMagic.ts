import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { findValidChallenge, markChallengeConsumed } from '../../models/authChallenge';
import { verifyOtp } from '../../utils/crypto';
import { getOrCreateUser } from '../../models/user';
import { signToken } from '../../utils/jwt';

const requestSchema = z.object({
  email: z.string().email(),
  token: z.string(),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const body = JSON.parse(event.body);
    const validated = requestSchema.parse(body);

    const email = validated.email.toLowerCase().trim();
    const token = validated.token;

    // Find valid challenge
    const challenge = await findValidChallenge(email, 'magic_link');
    if (!challenge) {
      return errorResponse('Invalid or expired link', 400);
    }

    // Verify token
    if (!challenge.tokenHash) {
      return errorResponse('Invalid challenge', 400);
    }

    const isValid = await verifyOtp(token, challenge.tokenHash);
    if (!isValid) {
      return errorResponse('Invalid token', 400);
    }

    // Mark challenge as consumed (one-time use)
    await markChallengeConsumed(challenge.challengeId);

    // Get or create user
    const user = await getOrCreateUser(email);

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
      return errorResponse(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    console.error('Error in auth/exchange-magic:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

