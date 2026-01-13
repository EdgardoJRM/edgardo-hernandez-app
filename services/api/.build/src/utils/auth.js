"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAuthToken = extractAuthToken;
exports.authenticateRequest = authenticateRequest;
const jwt_1 = require("./jwt");
function extractAuthToken(event) {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
        return null;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    return parts[1];
}
function authenticateRequest(event) {
    const token = extractAuthToken(event);
    if (!token) {
        throw new Error('Missing authorization token');
    }
    const payload = (0, jwt_1.verifyToken)(token);
    return {
        ...event,
        userId: payload.userId,
        email: payload.email,
    };
}
//# sourceMappingURL=auth.js.map