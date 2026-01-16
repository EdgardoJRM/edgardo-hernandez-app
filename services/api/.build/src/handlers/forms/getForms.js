"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../../utils/response");
const auth_1 = require("../../utils/auth");
const form_1 = require("../../models/form");
const handler = async (event) => {
    try {
        (0, auth_1.authenticateRequest)(event); // Just verify auth, don't need user data
        const forms = await (0, form_1.getAllForms)();
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify((0, response_1.successResponse)(forms.map(form => ({
                formId: form.formId,
                title: form.title,
                version: form.version,
                isActive: form.isActive,
            })))),
        };
    }
    catch (error) {
        if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
            return (0, response_1.errorResponse)(error.message, 401);
        }
        console.error('Error in getForms:', error);
        return (0, response_1.errorResponse)(error.message || 'Error interno del servidor', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=getForms.js.map