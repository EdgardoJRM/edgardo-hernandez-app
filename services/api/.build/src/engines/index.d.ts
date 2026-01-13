export interface EngineResult {
    archetype?: string;
    scoresByCategory?: Record<string, number>;
    recommendations?: string[];
    [key: string]: any;
}
export declare function runEngine(formId: string, answers: Record<string, any>): Promise<EngineResult>;
//# sourceMappingURL=index.d.ts.map