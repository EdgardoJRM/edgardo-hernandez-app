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
    code: zod_1.z.string().length(6),
});
const handler = async (event) => {
    try {
        if (!event.body) {
            return (0, response_1.errorResponse)('Request body is required', 400);
        }
        const body = JSON.parse(event.body);
        const validated = requestSchema.parse(body);
        const email = validated.email.toLowerCase().trim();
        const code = validated.code;
        // Find valid challenge
        const challenge = await (0, authChallenge_1.findValidChallenge)(email, 'otp');
        if (!challenge) {
            return (0, response_1.errorResponse)('Invalid or expired code', 400);
        }
        // Check attempts
        if ((0, authChallenge_1.isMaxAttemptsReached)(challenge.attempts)) {
            return (0, response_1.errorResponse)('Maximum attempts reached. Please request a new code.', 400);
        }
        // Verify OTP
        if (!challenge.otpHash) {
            return (0, response_1.errorResponse)('Invalid challenge', 400);
        }
        const isValid = await (0, crypto_1.verifyOtp)(code, challenge.otpHash);
        if (!isValid) {
            // Increment attempts
            const newAttempts = await (0, authChallenge_1.incrementChallengeAttempts)(challenge.challengeId);
            if ((0, authChallenge_1.isMaxAttemptsReached)(newAttempts)) {
                return (0, response_1.errorResponse)('Maximum attempts reached. Please request a new code.', 400);
            }
            return (0, response_1.errorResponse)('Invalid code', 400);
        }
        // Mark challenge as consumed
        await (0, authChallenge_1.markChallengeConsumed)(challenge.challengeId);
        // Get or create user
        const user = await (0, user_1.getOrCreateUser)(email);
        // Generate JWT
        const token = (0, jwt_1.signToken)({
            userId: user.userId,
            email: user.email,
        });
        return (0, response_1.successResponse)({
            token,
            user: {
                userId: user.userId,
                email: user.email,
                name: user.name,
                business: user.business,
                industry: user.industry,
                tags: user.tags,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return (0, response_1.errorResponse)(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
        }
        console.error('Error in auth/verify-otp:', error);
        return (0, response_1.errorResponse)(error.message || 'Internal server error', 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=verifyOtp.js.map