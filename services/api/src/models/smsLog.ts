import { docClient } from '../utils/dynamodb';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface SmsLog {
  smsLogId: string;
  to: string; // Número de teléfono
  message: string;
  status: 'sent' | 'failed' | 'pending' | 'delivered';
  sentAt?: number;
  deliveredAt?: number;
  errorMessage?: string;
  userId?: string; // Usuario relacionado si aplica
  metadata?: Record<string, any>;
  createdAt: number;
}

const SMS_LOGS_TABLE = process.env.SMS_LOGS_TABLE!;

export async function getSmsLogById(smsLogId: string): Promise<SmsLog | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: SMS_LOGS_TABLE,
      Key: { smsLogId },
    })
  );
  return result.Item as SmsLog | null;
}

export async function getSmsLogsByUser(userId: string): Promise<SmsLog[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: SMS_LOGS_TABLE,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
  );
  return (result.Items || []) as SmsLog[];
}

export async function getSmsLogsByPhone(phone: string, limit: number = 50): Promise<SmsLog[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: SMS_LOGS_TABLE,
      IndexName: 'to-index',
      KeyConditionExpression: '#to = :to',
      ExpressionAttributeNames: {
        '#to': 'to',
      },
      ExpressionAttributeValues: {
        ':to': phone,
      },
      Limit: limit,
      ScanIndexForward: false, // Más recientes primero
    })
  );
  return (result.Items || []) as SmsLog[];
}

export async function getAllSmsLogs(limit: number = 100): Promise<SmsLog[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: SMS_LOGS_TABLE,
      Limit: limit,
    })
  );
  return (result.Items || []) as SmsLog[];
}

export async function createSmsLog(smsLog: Omit<SmsLog, 'smsLogId' | 'createdAt'>): Promise<SmsLog> {
  const now = Date.now();
  const newSmsLog: SmsLog = {
    ...smsLog,
    smsLogId: uuidv4(),
    createdAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: SMS_LOGS_TABLE,
      Item: newSmsLog,
    })
  );
  return newSmsLog;
}

export async function updateSmsLogStatus(
  smsLogId: string,
  status: SmsLog['status'],
  sentAt?: number,
  deliveredAt?: number,
  errorMessage?: string
): Promise<SmsLog> {
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
  if (deliveredAt !== undefined) {
    updateExpressions.push('deliveredAt = :deliveredAt');
    expressionAttributeValues[':deliveredAt'] = deliveredAt;
  }
  if (errorMessage !== undefined) {
    updateExpressions.push('errorMessage = :errorMessage');
    expressionAttributeValues[':errorMessage'] = errorMessage;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: SMS_LOGS_TABLE,
      Key: { smsLogId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes as SmsLog;
}

