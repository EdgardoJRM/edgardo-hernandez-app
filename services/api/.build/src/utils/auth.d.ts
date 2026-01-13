import { APIGatewayProxyEvent } from 'aws-lambda';
export interface AuthenticatedEvent extends APIGatewayProxyEvent {
    userId: string;
    email: string;
}
export declare function extractAuthToken(event: APIGatewayProxyEvent): string | null;
export declare function authenticateRequest(event: APIGatewayProxyEvent): AuthenticatedEvent;
//# sourceMappingURL=auth.d.ts.map