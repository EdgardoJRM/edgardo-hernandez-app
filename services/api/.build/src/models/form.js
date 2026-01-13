"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormById = getFormById;
exports.getAllForms = getAllForms;
const dynamodb_1 = require("../utils/dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const FORMS_TABLE = process.env.FORMS_TABLE;
async function getFormById(formId) {
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.GetCommand({
        TableName: FORMS_TABLE,
        Key: { formId },
    }));
    return result.Item;
}
async function getAllForms() {
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.ScanCommand({
        TableName: FORMS_TABLE,
        FilterExpression: 'isActive = :active',
        ExpressionAttributeValues: {
            ':active': true,
        },
    }));
    return (result.Items || []);
}
//# sourceMappingURL=form.js.map