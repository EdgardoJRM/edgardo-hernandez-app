"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.createUser = createUser;
exports.getOrCreateUser = getOrCreateUser;
exports.updateUser = updateUser;
const dynamodb_1 = require("../utils/dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const USERS_TABLE = process.env.USERS_TABLE;
async function getUserById(userId) {
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
    }));
    return result.Item;
}
async function getUserByEmail(email) {
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.QueryCommand({
        TableName: USERS_TABLE,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
            ':email': email,
        },
        Limit: 1,
    }));
    return result.Items?.[0];
}
async function createUser(email) {
    const now = Date.now();
    const user = {
        userId: (0, uuid_1.v4)(),
        email,
        createdAt: now,
        updatedAt: now,
    };
    await dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
        TableName: USERS_TABLE,
        Item: user,
    }));
    return user;
}
async function getOrCreateUser(email) {
    const existing = await getUserByEmail(email);
    if (existing) {
        return existing;
    }
    return createUser(email);
}
async function updateUser(userId, updates) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    if (updates.name !== undefined) {
        updateExpressions.push('#name = :name');
        expressionAttributeNames['#name'] = 'name';
        expressionAttributeValues[':name'] = updates.name;
    }
    if (updates.business !== undefined) {
        updateExpressions.push('#business = :business');
        expressionAttributeNames['#business'] = 'business';
        expressionAttributeValues[':business'] = updates.business;
    }
    if (updates.industry !== undefined) {
        updateExpressions.push('#industry = :industry');
        expressionAttributeNames['#industry'] = 'industry';
        expressionAttributeValues[':industry'] = updates.industry;
    }
    if (updates.tags !== undefined) {
        updateExpressions.push('#tags = :tags');
        expressionAttributeNames['#tags'] = 'tags';
        expressionAttributeValues[':tags'] = updates.tags;
    }
    updateExpressions.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = Date.now();
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
    }));
    return result.Attributes;
}
//# sourceMappingURL=user.js.map