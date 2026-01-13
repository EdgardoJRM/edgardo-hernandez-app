import { getToken } from './storage';

// En desarrollo, usar serverless-offline local
// En producción, usar AWS Lambda
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/dev' 
    : 'https://13n353lry8.execute-api.us-east-1.amazonaws.com/dev');

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function apiFetch<T = any>(
  path: string,
  method: string = 'GET',
  body?: any,
  token?: string | null
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}/${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const authToken = token !== undefined ? token : await getToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

