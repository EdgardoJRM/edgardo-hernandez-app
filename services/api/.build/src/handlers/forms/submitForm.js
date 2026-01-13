"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const zod_1 = require("zod");
const response_1 = require("../../utils/response");
const auth_1 = require("../../utils/auth");
const form_1 = require("../../models/form");
const submission_1 = require("../../models/submission");
const engines_1 = require("../../engines");
const requestSchema = zod_1.z.object({
    answers: zod_1.z.record(zod_1.z.any()),
});
const handler = async (event) => {
    try {
        const authEvent = (0, auth_1.authenticateRequest)(event);
        const formId = event.pathParameters?.formId;
        if (!formId) {
            return (0, response_1.errorResponse)('formId is required', 400);
        }
        if (!event.body) {
            return (0, response_1.errorResponse)('Request body is required', 400);
        }
        const body = JSON.parse(event.body);
        const validated = requestSchema.parse(body);
        // Get form
        const form = await (0, form_1.getFormById)(formId);
        if (!form || !form.isActive) {
            return (0, response_1.errorResponse)('Form not found or not active', 404);
        }
        // Basic validation against form definition
        // (More sophisticated validation can be added)
        // Run engine to calculate result
        const result = await (0, engines_1.runEngine)(formId, validated.answers);
        // Save submission
        const submission = await (0, submission_1.createSubmission)(authEvent.userId, formId, validated.answers, result);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify((0, response_1.successResponse)({
                submissionId: submission.submissionId,
                result,
            })),
        };
    }
    catch (error) {
        if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
            return (0, response_1.errorResponse)(error.message, 401);
        }
        if (error instanceof zod_1.z.ZodError) {
            return (0, response_1.errorResponse)(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
        }
        console.error('Error in submitForm:', error);
        return (0, response_1.errorResponse)(error.message || 'Internal server error', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=submitForm.js.map