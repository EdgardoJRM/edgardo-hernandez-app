export type ChallengeType = 'magic_link' | 'otp';
export interface AuthChallenge {
    challengeId: string;
    email: string;
    type: ChallengeType;
    otpHash?: string;
    tokenHash?: string;
    expiresAt: number;
    consumedAt?: number;
    attempts: number;
    ip?: string;
    createdAt: number;
}
export declare function createChallenge(email: string, type: ChallengeType, hash: string, ttlMinutes: number, ip?: string): Promise<AuthChallenge>;
export declare function findValidChallenge(email: string, type: ChallengeType): Promise<AuthChallenge | null>;
export declare function markChallengeConsumed(challengeId: string): Promise<void>;
export declare function incrementChallengeAttempts(challengeId: string): Promise<number>;
export declare function isMaxAttemptsReached(attempts: number): boolean;
//# sourceMappingURL=authChallenge.d.ts.map