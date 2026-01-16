import { runArquetipoV1 } from './arquetipo_v1';

export interface EngineResult {
  archetype?: string;
  scoresByCategory?: Record<string, number>;
  recommendations?: string[];
  [key: string]: any;
}

export async function runEngine(formId: string, answers: Record<string, any>): Promise<EngineResult> {
  switch (formId) {
    case 'arquetipo_v1':
      return runArquetipoV1(answers);
    default:
      throw new Error(`No engine found for formId: ${formId}`);
  }
}


