"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../../utils/response");
const auth_1 = require("../../utils/auth");
const form_1 = require("../../models/form");
const handler = async (event) => {
    try {
        (0, auth_1.authenticateRequest)(event);
        const formId = event.pathParameters?.formId;
        if (!formId) {
            return (0, response_1.errorResponse)('formId is required', 400);
        }
        const form = await (0, form_1.getFormById)(formId);
        if (!form) {
            return (0, response_1.errorResponse)('Form not found', 404);
        }
        if (!form.isActive) {
            return (0, response_1.errorResponse)('Form is not active', 400);
        }
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify((0, response_1.successResponse)({
                formId: form.formId,
                title: form.title,
                version: form.version,
                definitionJSON: form.definitionJSON,
            })),
        };
    }
    catch (error) {
        if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
            return (0, response_1.errorResponse)(error.message, 401);
        }
        console.error('Error in getForm:', error);
        return (0, response_1.errorResponse)(error.message || 'Internal server error', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=getForm.js.map