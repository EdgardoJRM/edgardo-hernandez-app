"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const zod_1 = require("zod");
const response_1 = require("../../utils/response");
const authChallenge_1 = require("../../models/authChallenge");
const crypto_1 = require("../../utils/crypto");
const user_1 = require("../../models/user");
const jwt_1 = require("../../utils/jwt");
const requestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    token: zod_1.z.string(),
});
const handler = async (event) => {
    try {
        if (!event.body) {
            return (0, response_1.errorResponse)('El cuerpo de la solicitud es requerido', 400);
        }
        const body = JSON.parse(event.body);
        const validated = requestSchema.parse(body);
        const email = validated.email.toLowerCase().trim();
        const token = validated.token;
        // Find valid challenge
        const challenge = await (0, authChallenge_1.findValidChallenge)(email, 'magic_link');
        if (!challenge) {
            return (0, response_1.errorResponse)('Enlace inválido o expirado', 400);
        }
        // Verify token
        if (!challenge.tokenHash) {
            return (0, response_1.errorResponse)('Desafío inválido', 400);
        }
        const isValid = await (0, crypto_1.verifyOtp)(token, challenge.tokenHash);
        if (!isValid) {
            return (0, response_1.errorResponse)('Token inválido', 400);
        }
        // Mark challenge as consumed (one-time use)
        await (0, authChallenge_1.markChallengeConsumed)(challenge.challengeId);
        // Get or create user
        const user = await (0, user_1.getOrCreateUser)(email);
        // Generate JWT
        const tokenJWT = (0, jwt_1.signToken)({
            userId: user.userId,
            email: user.email,
        });
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify((0, response_1.successResponse)({
                token: tokenJWT,
                user: {
                    userId: user.userId,
                    email: user.email,
                    name: user.name,
                    business: user.business,
                    industry: user.industry,
                    tags: user.tags,
                },
            })),
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return (0, response_1.errorResponse)(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
        }
        console.error('Error in auth/exchange-magic:', error);
        return (0, response_1.errorResponse)(error.message || 'Error interno del servidor', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=exchangeMagic.js.map