import { docClient } from '../utils/dynamodb';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface EmailLog {
  emailLogId: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt?: number;
  errorMessage?: string;
  userId?: string; // Usuario relacionado si aplica
  templateId?: string;
  metadata?: Record<string, any>;
  createdAt: number;
}

const EMAIL_LOGS_TABLE = process.env.EMAIL_LOGS_TABLE!;

export async function getEmailLogById(emailLogId: string): Promise<EmailLog | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: EMAIL_LOGS_TABLE,
      Key: { emailLogId },
    })
  );
  return result.Item as EmailLog | null;
}

export async function getEmailLogsByUser(userId: string): Promise<EmailLog[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: EMAIL_LOGS_TABLE,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
  );
  return (result.Items || []) as EmailLog[];
}

export async function getEmailLogsByRecipient(email: string, limit: number = 50): Promise<EmailLog[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: EMAIL_LOGS_TABLE,
      IndexName: 'to-index',
      KeyConditionExpression: '#to = :to',
      ExpressionAttributeNames: {
        '#to': 'to',
      },
      ExpressionAttributeValues: {
        ':to': email,
      },
      Limit: limit,
      ScanIndexForward: false, // Más recientes primero
    })
  );
  return (result.Items || []) as EmailLog[];
}

export async function getAllEmailLogs(limit: number = 100): Promise<EmailLog[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: EMAIL_LOGS_TABLE,
      Limit: limit,
    })
  );
  return (result.Items || []) as EmailLog[];
}

export async function createEmailLog(emailLog: Omit<EmailLog, 'emailLogId' | 'createdAt'>): Promise<EmailLog> {
  const now = Date.now();
  const newEmailLog: EmailLog = {
    ...emailLog,
    emailLogId: uuidv4(),
    createdAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: EMAIL_LOGS_TABLE,
      Item: newEmailLog,
    })
  );
  return newEmailLog;
}

export async function updateEmailLogStatus(
  emailLogId: string,
  status: EmailLog['status'],
  sentAt?: number,
  errorMessage?: string
): Promise<EmailLog> {
  const updateExpressions: string[] = ['#status = :status'];
  const expressionAttributeNames: Record<string, string> = {
    '#status': 'status',
  };
  const expressionAttributeValues: Record<string, any> = {
    ':status': status,
  };

  if (sentAt !== undefined) {
    updateExpressions.push('sentAt = :sentAt');
    expressionAttributeValues[':sentAt'] = sentAt;
  }
  if (errorMessage !== undefined) {
    updateExpressions.push('errorMessage = :errorMessage');
    expressionAttributeValues[':errorMessage'] = errorMessage;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: EMAIL_LOGS_TABLE,
      Key: { emailLogId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes as EmailLog;
}

