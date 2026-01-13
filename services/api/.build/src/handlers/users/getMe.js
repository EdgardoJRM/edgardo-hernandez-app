"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../../utils/response");
const auth_1 = require("../../utils/auth");
const user_1 = require("../../models/user");
const handler = async (event) => {
    try {
        const authEvent = (0, auth_1.authenticateRequest)(event);
        const user = await (0, user_1.getUserById)(authEvent.userId);
        if (!user) {
            return (0, response_1.errorResponse)('User not found', 404);
        }
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify((0, response_1.successResponse)({
                userId: user.userId,
                email: user.email,
                name: user.name,
                business: user.business,
                industry: user.industry,
                tags: user.tags,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            })),
        };
    }
    catch (error) {
        if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
            return (0, response_1.errorResponse)(error.message, 401);
        }
        console.error('Error in getMe:', error);
        return (0, response_1.errorResponse)(error.message || 'Internal server error', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=getMe.js.map