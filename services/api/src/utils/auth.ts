import { APIGatewayProxyEvent } from 'aws-lambda';
import { verifyToken, JWTPayload } from './jwt';

export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  userId: string;
  email: string;
}

export function extractAuthToken(event: APIGatewayProxyEvent): string | null {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) {
    return null;
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  return parts[1];
}

export function authenticateRequest(event: APIGatewayProxyEvent): AuthenticatedEvent {
  const token = extractAuthToken(event);
  if (!token) {
    throw new Error('Missing authorization token');
  }
  const payload = verifyToken(token);
  return {
    ...event,
    userId: payload.userId,
    email: payload.email,
  };
}

