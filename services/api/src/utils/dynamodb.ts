import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const clientConfig: any = {
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

const client = new DynamoDBClient(clientConfig);

export const docClient = DynamoDBDocumentClient.from(client);

