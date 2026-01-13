export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export declare function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
export declare function verifyToken(token: string): JWTPayload;
//# sourceMappingURL=jwt.d.ts.map