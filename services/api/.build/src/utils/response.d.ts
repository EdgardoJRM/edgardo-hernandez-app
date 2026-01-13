import { APIGatewayProxyResult } from 'aws-lambda';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
export declare function successResponse<T>(data: T): APIGatewayProxyResult;
export declare function errorResponse(error: string, statusCode?: number): APIGatewayProxyResult;
//# sourceMappingURL=response.d.ts.map