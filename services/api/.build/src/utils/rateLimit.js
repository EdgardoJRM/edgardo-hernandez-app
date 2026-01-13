"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
const dynamodb_1 = require("./dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const RATE_LIMIT_TABLE = 'rate-limits';
const MAX_REQUESTS = 5;
const WINDOW_MINUTES = 10;
async function checkRateLimit(key, maxRequests = MAX_REQUESTS, windowMinutes = WINDOW_MINUTES) {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - windowMinutes * 60;
    const itemKey = `rate_limit_${key}_${Math.floor(now / (windowMinutes * 60))}`;
    try {
        const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.GetCommand({
            TableName: RATE_LIMIT_TABLE,
            Key: { key: itemKey },
        }));
        const count = result.Item?.count || 0;
        if (count >= maxRequests) {
            return false;
        }
        await dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: RATE_LIMIT_TABLE,
            Item: {
                key: itemKey,
                count: count + 1,
                ttl: now + windowMinutes * 60,
            },
        }));
        return true;
    }
    catch (error) {
        // If table doesn't exist in local dev, allow request
        console.warn('Rate limit check failed:', error);
        return true;
    }
}
//# sourceMappingURL=rateLimit.js.map