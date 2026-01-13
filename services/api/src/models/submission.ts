import { docClient } from '../utils/dynamodb';
import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Submission {
  submissionId: string;
  userId: string;
  formId: string;
  answersJSON: Record<string, any>;
  resultJSON: Record<string, any>;
  createdAt: number;
}

const SUBMISSIONS_TABLE = process.env.SUBMISSIONS_TABLE!;

export async function createSubmission(
  userId: string,
  formId: string,
  answersJSON: Record<string, any>,
  resultJSON: Record<string, any>
): Promise<Submission> {
  const submission: Submission = {
    submissionId: uuidv4(),
    userId,
    formId,
    answersJSON,
    resultJSON,
    createdAt: Date.now(),
  };

  await docClient.send(
    new PutCommand({
      TableName: SUBMISSIONS_TABLE,
      Item: submission,
    })
  );

  return submission;
}

export async function getSubmissionById(submissionId: string): Promise<Submission | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: SUBMISSIONS_TABLE,
      Key: { submissionId },
    })
  );
  return result.Item as Submission | null;
}

export async function getSubmissionsByUserId(userId: string): Promise<Submission[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: SUBMISSIONS_TABLE,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
    })
  );
  return (result.Items || []) as Submission[];
}

