import { APIGatewayProxyResult } from 'aws-lambda';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function successResponse<T>(data: T): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
    body: JSON.stringify({
      success: true,
      data,
    }),
  };
}

export function errorResponse(error: string, statusCode: number = 400): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
    body: JSON.stringify({
      success: false,
      error,
    }),
  };
}

