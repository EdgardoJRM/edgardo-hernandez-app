"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docClient = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const clientConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
};
// Use local DynamoDB endpoint if available (for local development)
if (process.env.AWS_ENDPOINT_URL) {
    clientConfig.endpoint = process.env.AWS_ENDPOINT_URL;
    clientConfig.credentials = {
        accessKeyId: 'local',
        secretAccessKey: 'local',
    };
}
const client = new client_dynamodb_1.DynamoDBClient(clientConfig);
exports.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
//# sourceMappingURL=dynamodb.js.map