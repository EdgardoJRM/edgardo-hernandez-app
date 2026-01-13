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
            return (0, response_1.errorResponse)('submissionId is required', 400);
        }
        const submission = await (0, submission_1.getSubmissionById)(submissionId);
        if (!submission) {
            return (0, response_1.errorResponse)('Submission not found', 404);
        }
        // Verify ownership
        if (submission.userId !== authEvent.userId) {
            return (0, response_1.errorResponse)('Unauthorized', 403);
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
        if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
            return (0, response_1.errorResponse)(error.message, 401);
        }
        console.error('Error in getSubmission:', error);
        return (0, response_1.errorResponse)(error.message || 'Internal server error', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=getSubmission.js.map