"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const zod_1 = require("zod");
const response_1 = require("../../utils/response");
const rateLimit_1 = require("../../utils/rateLimit");
const authChallenge_1 = require("../../models/authChallenge");
const crypto_1 = require("../../utils/crypto");
const email_1 = require("../../utils/email");
const requestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
const handler = async (event) => {
    try {
        if (!event.body) {
            return (0, response_1.errorResponse)('El cuerpo de la solicitud es requerido', 400);
        }
        const body = JSON.parse(event.body);
        const validated = requestSchema.parse(body);
        const email = validated.email.toLowerCase().trim();
        // Rate limiting
        const clientIp = event.requestContext.identity?.sourceIp || 'unknown';
        const rateLimitKey = `${email}_${clientIp}`;
        const canProceed = await (0, rateLimit_1.checkRateLimit)(rateLimitKey, 5, 10);
        if (!canProceed) {
            return (0, response_1.errorResponse)('Demasiadas solicitudes. Por favor intenta más tarde.', 429);
        }
        // Generate both OTP and Magic Link
        const otp = (0, crypto_1.generateOtp)();
        const otpHash = await (0, crypto_1.hashOtp)(otp);
        const token = (0, crypto_1.generateToken)();
        const tokenHash = await (0, crypto_1.hashOtp)(token);
        // Create both challenges
        await (0, authChallenge_1.createChallenge)(email, 'otp', otpHash, 10, clientIp);
        await (0, authChallenge_1.createChallenge)(email, 'magic_link', tokenHash, 15, clientIp);
        // Send combined email with both methods
        await (0, email_1.sendCombinedAuthEmail)(email, otp, token);
        return (0, response_1.successResponse)({ message: 'sent' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return (0, response_1.errorResponse)(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`, 400);
        }
        console.error('Error in auth/start:', error);
        return (0, response_1.errorResponse)(error.message || 'Error interno del servidor', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=start.js.map