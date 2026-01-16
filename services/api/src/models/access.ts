import { docClient } from '../utils/dynamodb';
import { GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export type AccessType = 'material' | 'course' | 'event' | 'resource';

export interface Access {
  accessId: string;
  userId: string;
  accessType: AccessType;
  resourceId: string; // ID del material, curso, evento, etc.
  resourceName?: string; // Nombre del recurso para referencia rápida
  clickfunnelsCourseId?: string; // ID del curso en ClickFunnels si aplica
  grantedBy: string; // userId del empleado que otorgó el acceso
  grantedAt: number;
  expiresAt?: number; // Opcional: fecha de expiración
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

const ACCESS_TABLE = process.env.ACCESS_TABLE!;

export async function getAccessById(accessId: string): Promise<Access | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: ACCESS_TABLE,
      Key: { accessId },
    })
  );
  return result.Item as Access | null;
}

export async function getUserAccess(userId: string, accessType?: AccessType): Promise<Access[]> {
  let keyCondition = 'userId = :userId';
  const expressionAttributeValues: Record<string, any> = {
    ':userId': userId,
  };

  if (accessType) {
    keyCondition += ' AND accessType = :accessType';
    expressionAttributeValues[':accessType'] = accessType;
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: ACCESS_TABLE,
      IndexName: 'userId-accessType-index',
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
  return (result.Items || []) as Access[];
}

export async function getAccessByResource(resourceId: string, accessType: AccessType): Promise<Access[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: ACCESS_TABLE,
      IndexName: 'resourceId-accessType-index',
      KeyConditionExpression: 'resourceId = :resourceId AND accessType = :accessType',
      ExpressionAttributeValues: {
        ':resourceId': resourceId,
        ':accessType': accessType,
      },
    })
  );
  return (result.Items || []) as Access[];
}

export async function checkUserAccess(userId: string, resourceId: string, accessType: AccessType): Promise<boolean> {
  const now = Date.now();
  const result = await docClient.send(
    new QueryCommand({
      TableName: ACCESS_TABLE,
      IndexName: 'userId-accessType-index',
      KeyConditionExpression: 'userId = :userId AND accessType = :accessType',
      FilterExpression: 'resourceId = :resourceId AND (attribute_not_exists(expiresAt) OR expiresAt > :now)',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':accessType': accessType,
        ':resourceId': resourceId,
        ':now': now,
      },
      Limit: 1,
    })
  );
  return (result.Items?.length || 0) > 0;
}

export async function grantAccess(access: Omit<Access, 'accessId' | 'createdAt' | 'updatedAt'>): Promise<Access> {
  const now = Date.now();
  const newAccess: Access = {
    ...access,
    accessId: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: ACCESS_TABLE,
      Item: newAccess,
    })
  );
  return newAccess;
}

export async function revokeAccess(accessId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: ACCESS_TABLE,
      Key: { accessId },
    })
  );
}

export async function revokeUserAccess(userId: string, resourceId: string, accessType: AccessType): Promise<void> {
  const accesses = await getUserAccess(userId, accessType);
  const access = accesses.find(a => a.resourceId === resourceId);
  if (access) {
    await revokeAccess(access.accessId);
  }
}

