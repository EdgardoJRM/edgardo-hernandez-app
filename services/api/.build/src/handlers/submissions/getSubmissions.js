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
        if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
            return (0, response_1.errorResponse)(error.message, 401);
        }
        console.error('Error in getSubmissions:', error);
        return (0, response_1.errorResponse)(error.message || 'Internal server error', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=getSubmissions.js.map