"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChallenge = createChallenge;
exports.findValidChallenge = findValidChallenge;
exports.markChallengeConsumed = markChallengeConsumed;
exports.incrementChallengeAttempts = incrementChallengeAttempts;
exports.isMaxAttemptsReached = isMaxAttemptsReached;
const dynamodb_1 = require("../utils/dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const AUTH_CHALLENGES_TABLE = process.env.AUTH_CHALLENGES_TABLE;
const MAX_ATTEMPTS = 5;
async function createChallenge(email, type, hash, ttlMinutes, ip) {
    const now = Math.floor(Date.now() / 1000);
    const challenge = {
        challengeId: (0, uuid_1.v4)(),
        email,
        type,
        expiresAt: now + ttlMinutes * 60,
        attempts: 0,
        createdAt: now,
        ip,
    };
    if (type === 'otp') {
        challenge.otpHash = hash;
    }
    else {
        challenge.tokenHash = hash;
    }
    await dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
        TableName: AUTH_CHALLENGES_TABLE,
        Item: challenge,
    }));
    return challenge;
}
async function findValidChallenge(email, type) {
    const now = Math.floor(Date.now() / 1000);
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.QueryCommand({
        TableName: AUTH_CHALLENGES_TABLE,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        FilterExpression: '#type = :type AND expiresAt > :now AND attribute_not_exists(consumedAt)',
        ExpressionAttributeNames: {
            '#type': 'type',
        },
        ExpressionAttributeValues: {
            ':email': email,
            ':type': type,
            ':now': now,
        },
        Limit: 1,
        ScanIndexForward: false,
    }));
    return result.Items?.[0];
}
async function markChallengeConsumed(challengeId) {
    const now = Math.floor(Date.now() / 1000);
    await dynamodb_1.docClient.send(new lib_dynamodb_1.UpdateCommand({
        TableName: AUTH_CHALLENGES_TABLE,
        Key: { challengeId },
        UpdateExpression: 'SET consumedAt = :consumedAt',
        ExpressionAttributeValues: {
            ':consumedAt': now,
        },
    }));
}
async function incrementChallengeAttempts(challengeId) {
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.UpdateCommand({
        TableName: AUTH_CHALLENGES_TABLE,
        Key: { challengeId },
        UpdateExpression: 'ADD attempts :inc',
        ExpressionAttributeValues: {
            ':inc': 1,
        },
        ReturnValues: 'ALL_NEW',
    }));
    return result.Attributes.attempts;
}
function isMaxAttemptsReached(attempts) {
    return attempts >= MAX_ATTEMPTS;
}
//# sourceMappingURL=authChallenge.js.map