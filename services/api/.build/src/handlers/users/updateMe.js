"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const zod_1 = require("zod");
const response_1 = require("../../utils/response");
const auth_1 = require("../../utils/auth");
const user_1 = require("../../models/user");
const requestSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    business: zod_1.z.string().optional(),
    industry: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
const handler = async (event) => {
    try {
        const authEvent = (0, auth_1.authenticateRequest)(event);
        if (!event.body) {
            return (0, response_1.errorResponse)('Request body is required', 400);
        }
        const body = JSON.parse(event.body);
        const validated = requestSchema.parse(body);
        const updatedUser = await (0, user_1.updateUser)(authEvent.userId, validated);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify((0, response_1.successResponse)({
                userId: updatedUser.userId,
                email: updatedUser.email,
                name: updatedUser.name,
                business: updatedUser.business,
                industry: updatedUser.industry,
                tags: updatedUser.tags,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
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
        console.error('Error in updateMe:', error);
        return (0, response_1.errorResponse)(error.message || 'Internal server error', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=updateMe.js.map