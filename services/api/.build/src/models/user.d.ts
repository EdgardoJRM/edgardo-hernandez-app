export interface User {
    userId: string;
    email: string;
    name?: string;
    business?: string;
    industry?: string;
    tags?: string[];
    createdAt: number;
    updatedAt: number;
}
export declare function getUserById(userId: string): Promise<User | null>;
export declare function getUserByEmail(email: string): Promise<User | null>;
export declare function createUser(email: string): Promise<User>;
export declare function getOrCreateUser(email: string): Promise<User>;
export declare function updateUser(userId: string, updates: Partial<Omit<User, 'userId' | 'email' | 'createdAt'>>): Promise<User>;
//# sourceMappingURL=user.d.ts.map