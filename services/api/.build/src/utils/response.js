"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
function successResponse(data) {
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
function errorResponse(error, statusCode = 400) {
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
//# sourceMappingURL=response.js.map