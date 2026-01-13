import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest } from '../../utils/auth';
import { getUserById } from '../../models/user';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = authenticateRequest(event);
    const user = await getUserById(authEvent.userId);

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        successResponse({
          userId: user.userId,
          email: user.email,
          name: user.name,
          business: user.business,
          industry: user.industry,
          tags: user.tags,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
      ),
    };
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getMe:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

