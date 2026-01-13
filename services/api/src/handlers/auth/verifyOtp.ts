import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../utils/response';
import { findValidChallenge, markChallengeConsumed, incrementChallengeAttempts, isMaxAttemptsReached } from '../../models/authChallenge';
import { verifyOtp } from '../../utils/crypto';
import { getOrCreateUser } from '../../models/user';
import { signToken } from '../../utils/jwt';

const requestSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
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
    const code = validated.code;

    // Find valid challenge
    const challenge = await findValidChallenge(email, 'otp');
    if (!challenge) {
      return errorResponse('Invalid or expired code', 400);
    }

    // Check attempts
    if (isMaxAttemptsReached(challenge.attempts)) {
      return errorResponse('Maximum attempts reached. Please request a new code.', 400);
    }

    // Verify OTP
    if (!challenge.otpHash) {
      return errorResponse('Invalid challenge', 400);
    }

    const isValid = await verifyOtp(code, challenge.otpHash);
    if (!isValid) {
      // Increment attempts
      const newAttempts = await incrementChallengeAttempts(challenge.challengeId);
      if (isMaxAttemptsReached(newAttempts)) {
        return errorResponse('Maximum attempts reached. Please request a new code.', 400);
      }
      return errorResponse('Invalid code', 400);
    }

    // Mark challenge as consumed
    await markChallengeConsumed(challenge.challengeId);

    // Get or create user
    const user = await getOrCreateUser(email);

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
      return errorResponse(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    console.error('Error in auth/verify-otp:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

