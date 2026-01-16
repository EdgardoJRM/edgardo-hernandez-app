"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../../utils/response");
const auth_1 = require("../../utils/auth");
const submission_1 = require("../../models/submission");
const handler = async (event) => {
    try {
        const authEvent = (0, auth_1.authenticateRequest)(event);
        const submissions = await (0, submission_1.getSubmissionsByUserId)(authEvent.userId);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify((0, response_1.successResponse)(submissions.map(sub => ({
                submissionId: sub.submissionId,
                formId: sub.formId,
                createdAt: sub.createdAt,
            })))),
        };
    }
    catch (error) {
        if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
            return (0, response_1.errorResponse)(error.message, 401);
        }
        console.error('Error in getSubmissions:', error);
        return (0, response_1.errorResponse)(error.message || 'Error interno del servidor', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=getSubmissions.js.map