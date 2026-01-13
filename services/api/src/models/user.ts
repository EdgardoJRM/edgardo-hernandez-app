import { docClient } from '../utils/dynamodb';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  userId: string;
  email: string;
  name?: string;
  business?: string;
  industry?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

const USERS_TABLE = process.env.USERS_TABLE!;

export async function getUserById(userId: string): Promise<User | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
    })
  );
  return result.Item as User | null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
      Limit: 1,
    })
  );
  return result.Items?.[0] as User | null;
}

export async function createUser(email: string): Promise<User> {
  const now = Date.now();
  const user: User = {
    userId: uuidv4(),
    email,
    createdAt: now,
    updatedAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
    })
  );
  return user;
}

export async function getOrCreateUser(email: string): Promise<User> {
  const existing = await getUserByEmail(email);
  if (existing) {
    return existing;
  }
  return createUser(email);
}

export async function updateUser(userId: string, updates: Partial<Omit<User, 'userId' | 'email' | 'createdAt'>>): Promise<User> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

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

  const result = await docClient.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes as User;
}

