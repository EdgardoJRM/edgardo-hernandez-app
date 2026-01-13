"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubmission = createSubmission;
exports.getSubmissionById = getSubmissionById;
exports.getSubmissionsByUserId = getSubmissionsByUserId;
const dynamodb_1 = require("../utils/dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const SUBMISSIONS_TABLE = process.env.SUBMISSIONS_TABLE;
async function createSubmission(userId, formId, answersJSON, resultJSON) {
    const submission = {
        submissionId: (0, uuid_1.v4)(),
        userId,
        formId,
        answersJSON,
        resultJSON,
        createdAt: Date.now(),
    };
    await dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
        TableName: SUBMISSIONS_TABLE,
        Item: submission,
    }));
    return submission;
}
async function getSubmissionById(submissionId) {
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.GetCommand({
        TableName: SUBMISSIONS_TABLE,
        Key: { submissionId },
    }));
    return result.Item;
}
async function getSubmissionsByUserId(userId) {
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.QueryCommand({
        TableName: SUBMISSIONS_TABLE,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId,
        },
        ScanIndexForward: false,
    }));
    return (result.Items || []);
}
//# sourceMappingURL=submission.js.map