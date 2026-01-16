import { APIGatewayProxyEvent } from 'aws-lambda';
import { verifyToken, JWTPayload } from './jwt';
import { getUserById } from '../models/user';
import { UserRole } from '../models/user';

export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  userId: string;
  email: string;
  userRole?: UserRole;
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

export async function authenticateRequest(event: APIGatewayProxyEvent): Promise<AuthenticatedEvent> {
  const token = extractAuthToken(event);
  if (!token) {
    throw new Error('Token de autorización faltante');
  }
  const payload = verifyToken(token);
  const user = await getUserById(payload.userId);
  return {
    ...event,
    userId: payload.userId,
    email: payload.email,
    userRole: user?.role || 'user',
  };
}

export function requireRole(event: AuthenticatedEvent, allowedRoles: UserRole[]): void {
  const userRole = event.userRole || 'user';
  if (!allowedRoles.includes(userRole)) {
    throw new Error('No tienes permisos para acceder a este recurso');
  }
}

