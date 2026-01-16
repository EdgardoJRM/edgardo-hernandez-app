"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../../utils/response");
const auth_1 = require("../../utils/auth");
const submission_1 = require("../../models/submission");
const handler = async (event) => {
    try {
        const authEvent = (0, auth_1.authenticateRequest)(event);
        const submissionId = event.pathParameters?.submissionId;
        if (!submissionId) {
            return (0, response_1.errorResponse)('El submissionId es requerido', 400);
        }
        const submission = await (0, submission_1.getSubmissionById)(submissionId);
        if (!submission) {
            return (0, response_1.errorResponse)('Respuesta no encontrada', 404);
        }
        // Verify ownership
        if (submission.userId !== authEvent.userId) {
            return (0, response_1.errorResponse)('No autorizado', 403);
        }
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify((0, response_1.successResponse)({
                submissionId: submission.submissionId,
                formId: submission.formId,
                answersJSON: submission.answersJSON,
                resultJSON: submission.resultJSON,
                createdAt: submission.createdAt,
            })),
        };
    }
    catch (error) {
        if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
            return (0, response_1.errorResponse)(error.message, 401);
        }
        console.error('Error in getSubmission:', error);
        return (0, response_1.errorResponse)(error.message || 'Error interno del servidor', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=getSubmission.js.map