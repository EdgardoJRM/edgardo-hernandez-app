import { docClient } from '../utils/dynamodb';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface EventRegistration {
  registrationId: string;
  eventId: string;
  userId?: string; // Opcional, puede ser registro sin usuario
  email: string;
  name: string;
  phone?: string;
  ticketCode: string; // Código único para la entrada (QR)
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in';
  checkedInAt?: number;
  checkedInBy?: string; // userId del empleado que hizo el check-in
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

const REGISTRATIONS_TABLE = process.env.EVENT_REGISTRATIONS_TABLE!;

export async function getRegistrationById(registrationId: string): Promise<EventRegistration | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: REGISTRATIONS_TABLE,
      Key: { registrationId },
    })
  );
  return result.Item as EventRegistration | null;
}

export async function getRegistrationByTicketCode(ticketCode: string): Promise<EventRegistration | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: REGISTRATIONS_TABLE,
      IndexName: 'ticketCode-index',
      KeyConditionExpression: 'ticketCode = :ticketCode',
      ExpressionAttributeValues: {
        ':ticketCode': ticketCode,
      },
      Limit: 1,
    })
  );
  return (result.Items?.[0] || null) as EventRegistration | null;
}

export async function getRegistrationsByEvent(eventId: string): Promise<EventRegistration[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: REGISTRATIONS_TABLE,
      IndexName: 'eventId-index',
      KeyConditionExpression: 'eventId = :eventId',
      ExpressionAttributeValues: {
        ':eventId': eventId,
      },
    })
  );
  return (result.Items || []) as EventRegistration[];
}

export async function getRegistrationsByUser(userId: string): Promise<EventRegistration[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: REGISTRATIONS_TABLE,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
  );
  return (result.Items || []) as EventRegistration[];
}

export async function getRegistrationsByEmail(email: string): Promise<EventRegistration[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: REGISTRATIONS_TABLE,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    })
  );
  return (result.Items || []) as EventRegistration[];
}

export async function createRegistration(registration: Omit<EventRegistration, 'registrationId' | 'createdAt' | 'updatedAt'>): Promise<EventRegistration> {
  const now = Date.now();
  const newRegistration: EventRegistration = {
    ...registration,
    registrationId: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: REGISTRATIONS_TABLE,
      Item: newRegistration,
    })
  );
  return newRegistration;
}

export async function updateRegistration(registrationId: string, updates: Partial<Omit<EventRegistration, 'registrationId' | 'createdAt'>>): Promise<EventRegistration> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  if (updates.status !== undefined) {
    updateExpressions.push('#status = :status');
    expressionAttributeNames['#status'] = 'status';
    expressionAttributeValues[':status'] = updates.status;
  }
  if (updates.checkedInAt !== undefined) {
    updateExpressions.push('checkedInAt = :checkedInAt');
    expressionAttributeValues[':checkedInAt'] = updates.checkedInAt;
  }
  if (updates.checkedInBy !== undefined) {
    updateExpressions.push('checkedInBy = :checkedInBy');
    expressionAttributeValues[':checkedInBy'] = updates.checkedInBy;
  }
  if (updates.paymentStatus !== undefined) {
    updateExpressions.push('paymentStatus = :paymentStatus');
    expressionAttributeValues[':paymentStatus'] = updates.paymentStatus;
  }
  if (updates.name !== undefined) {
    updateExpressions.push('#name = :name');
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':name'] = updates.name;
  }
  if (updates.phone !== undefined) {
    updateExpressions.push('phone = :phone');
    expressionAttributeValues[':phone'] = updates.phone;
  }
  if (updates.metadata !== undefined) {
    updateExpressions.push('metadata = :metadata');
    expressionAttributeValues[':metadata'] = updates.metadata;
  }

  updateExpressions.push('updatedAt = :updatedAt');
  expressionAttributeValues[':updatedAt'] = Date.now();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: REGISTRATIONS_TABLE,
      Key: { registrationId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes as EventRegistration;
}

export async function checkInRegistration(registrationId: string, checkedInBy: string): Promise<EventRegistration> {
  return updateRegistration(registrationId, {
    status: 'checked_in',
    checkedInAt: Date.now(),
    checkedInBy,
  });
}

