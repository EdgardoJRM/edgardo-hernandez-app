import { docClient } from '../utils/dynamodb';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Event {
  eventId: string;
  title: string;
  description?: string;
  type: 'event' | 'workshop' | 'seminar' | 'conference';
  startDate: number;
  endDate: number;
  location?: string;
  locationUrl?: string;
  capacity?: number;
  price?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  imageUrl?: string;
  tags?: string[];
  clickfunnelsProductId?: string; // ID del producto en ClickFunnels asociado a este evento
  createdBy: string; // userId
  createdAt: number;
  updatedAt: number;
}

const EVENTS_TABLE = process.env.EVENTS_TABLE!;

export async function getEventById(eventId: string): Promise<Event | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: EVENTS_TABLE,
      Key: { eventId },
    })
  );
  return result.Item as Event | null;
}

export async function getAllEvents(): Promise<Event[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: EVENTS_TABLE,
    })
  );
  return (result.Items || []) as Event[];
}

export async function getEventsByStatus(status: Event['status']): Promise<Event[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: EVENTS_TABLE,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
      },
    })
  );
  return (result.Items || []) as Event[];
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const now = Date.now();
  const result = await docClient.send(
    new ScanCommand({
      TableName: EVENTS_TABLE,
      FilterExpression: 'startDate > :now AND #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':now': now,
        ':status': 'published',
      },
    })
  );
  return (result.Items || []) as Event[];
}

export async function getEventByClickFunnelsProductId(productId: string): Promise<Event | null> {
  // Usar el índice para buscar más eficientemente
  const result = await docClient.send(
    new QueryCommand({
      TableName: EVENTS_TABLE,
      IndexName: 'clickfunnelsProductId-index',
      KeyConditionExpression: 'clickfunnelsProductId = :productId',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':productId': productId,
        ':status': 'published',
      },
    })
  );
  return result.Items && result.Items.length > 0 ? (result.Items[0] as Event) : null;
}

export async function createEvent(event: Omit<Event, 'eventId' | 'createdAt' | 'updatedAt'>): Promise<Event> {
  const now = Date.now();
  const newEvent: Event = {
    ...event,
    eventId: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: EVENTS_TABLE,
      Item: newEvent,
    })
  );
  return newEvent;
}

export async function updateEvent(eventId: string, updates: Partial<Omit<Event, 'eventId' | 'createdAt'>>): Promise<Event> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  if (updates.title !== undefined) {
    updateExpressions.push('#title = :title');
    expressionAttributeNames['#title'] = 'title';
    expressionAttributeValues[':title'] = updates.title;
  }
  if (updates.description !== undefined) {
    updateExpressions.push('description = :description');
    expressionAttributeValues[':description'] = updates.description;
  }
  if (updates.type !== undefined) {
    updateExpressions.push('#type = :type');
    expressionAttributeNames['#type'] = 'type';
    expressionAttributeValues[':type'] = updates.type;
  }
  if (updates.startDate !== undefined) {
    updateExpressions.push('startDate = :startDate');
    expressionAttributeValues[':startDate'] = updates.startDate;
  }
  if (updates.endDate !== undefined) {
    updateExpressions.push('endDate = :endDate');
    expressionAttributeValues[':endDate'] = updates.endDate;
  }
  if (updates.location !== undefined) {
    updateExpressions.push('location = :location');
    expressionAttributeValues[':location'] = updates.location;
  }
  if (updates.locationUrl !== undefined) {
    updateExpressions.push('locationUrl = :locationUrl');
    expressionAttributeValues[':locationUrl'] = updates.locationUrl;
  }
  if (updates.capacity !== undefined) {
    updateExpressions.push('capacity = :capacity');
    expressionAttributeValues[':capacity'] = updates.capacity;
  }
  if (updates.price !== undefined) {
    updateExpressions.push('price = :price');
    expressionAttributeValues[':price'] = updates.price;
  }
  if (updates.status !== undefined) {
    updateExpressions.push('#status = :status');
    expressionAttributeNames['#status'] = 'status';
    expressionAttributeValues[':status'] = updates.status;
  }
  if (updates.imageUrl !== undefined) {
    updateExpressions.push('imageUrl = :imageUrl');
    expressionAttributeValues[':imageUrl'] = updates.imageUrl;
  }
  if (updates.tags !== undefined) {
    updateExpressions.push('tags = :tags');
    expressionAttributeValues[':tags'] = updates.tags;
  }
  if (updates.clickfunnelsProductId !== undefined) {
    updateExpressions.push('clickfunnelsProductId = :clickfunnelsProductId');
    expressionAttributeValues[':clickfunnelsProductId'] = updates.clickfunnelsProductId;
  }

  updateExpressions.push('updatedAt = :updatedAt');
  expressionAttributeValues[':updatedAt'] = Date.now();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: EVENTS_TABLE,
      Key: { eventId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes as Event;
}

export async function deleteEvent(eventId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: EVENTS_TABLE,
      Key: { eventId },
    })
  );
}

