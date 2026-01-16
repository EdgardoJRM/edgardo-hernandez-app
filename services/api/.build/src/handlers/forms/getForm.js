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
            return (0, response_1.errorResponse)('El formId es requerido', 400);
        }
        const form = await (0, form_1.getFormById)(formId);
        if (!form) {
            return (0, response_1.errorResponse)('Formulario no encontrado', 404);
        }
        if (!form.isActive) {
            return (0, response_1.errorResponse)('El formulario no está activo', 400);
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
        if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
            return (0, response_1.errorResponse)(error.message, 401);
        }
        console.error('Error in getForm:', error);
        return (0, response_1.errorResponse)(error.message || 'Error interno del servidor', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=getForm.js.map