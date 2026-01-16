import { docClient } from '../utils/dynamodb';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Birthday {
  birthdayId: string;
  userId: string;
  name: string;
  dateOfBirth: number; // Timestamp del día de nacimiento (sin hora)
  email?: string;
  phone?: string;
  lastNotified?: number; // Última vez que se envió notificación
  notificationSent: boolean;
  createdAt: number;
  updatedAt: number;
}

const BIRTHDAYS_TABLE = process.env.BIRTHDAYS_TABLE!;

export async function getBirthdayById(birthdayId: string): Promise<Birthday | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: BIRTHDAYS_TABLE,
      Key: { birthdayId },
    })
  );
  return result.Item as Birthday | null;
}

export async function getBirthdayByUser(userId: string): Promise<Birthday | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: BIRTHDAYS_TABLE,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: 1,
    })
  );
  return (result.Items?.[0] || null) as Birthday | null;
}

export async function getUpcomingBirthdays(daysAhead: number = 30): Promise<Birthday[]> {
  const now = Date.now();
  const today = new Date(now);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  // Calcular el rango de fechas
  const startDate = new Date(currentYear, currentMonth, currentDay).getTime();
  const endDate = new Date(currentYear, currentMonth, currentDay + daysAhead).getTime();

  // Obtener todos los cumpleaños y filtrar
  const allBirthdays = await getAllBirthdays();
  
  return allBirthdays.filter(birthday => {
    const birthDate = new Date(birthday.dateOfBirth);
    const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate()).getTime();
    return thisYearBirthday >= startDate && thisYearBirthday <= endDate;
  });
}

export async function getTodayBirthdays(): Promise<Birthday[]> {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const allBirthdays = await getAllBirthdays();
  
  return allBirthdays.filter(birthday => {
    const birthDate = new Date(birthday.dateOfBirth);
    return birthDate.getMonth() === currentMonth && birthDate.getDate() === currentDay;
  });
}

export async function getAllBirthdays(): Promise<Birthday[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: BIRTHDAYS_TABLE,
    })
  );
  return (result.Items || []) as Birthday[];
}

export async function createBirthday(birthday: Omit<Birthday, 'birthdayId' | 'createdAt' | 'updatedAt'>): Promise<Birthday> {
  const now = Date.now();
  const newBirthday: Birthday = {
    ...birthday,
    birthdayId: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: BIRTHDAYS_TABLE,
      Item: newBirthday,
    })
  );
  return newBirthday;
}

export async function updateBirthday(birthdayId: string, updates: Partial<Omit<Birthday, 'birthdayId' | 'createdAt'>>): Promise<Birthday> {
  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, any> = {};

  if (updates.name !== undefined) {
    updateExpressions.push('#name = :name');
    expressionAttributeValues[':name'] = updates.name;
  }
  if (updates.dateOfBirth !== undefined) {
    updateExpressions.push('dateOfBirth = :dateOfBirth');
    expressionAttributeValues[':dateOfBirth'] = updates.dateOfBirth;
  }
  if (updates.email !== undefined) {
    updateExpressions.push('email = :email');
    expressionAttributeValues[':email'] = updates.email;
  }
  if (updates.phone !== undefined) {
    updateExpressions.push('phone = :phone');
    expressionAttributeValues[':phone'] = updates.phone;
  }
  if (updates.lastNotified !== undefined) {
    updateExpressions.push('lastNotified = :lastNotified');
    expressionAttributeValues[':lastNotified'] = updates.lastNotified;
  }
  if (updates.notificationSent !== undefined) {
    updateExpressions.push('notificationSent = :notificationSent');
    expressionAttributeValues[':notificationSent'] = updates.notificationSent;
  }

  updateExpressions.push('updatedAt = :updatedAt');
  expressionAttributeValues[':updatedAt'] = Date.now();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: BIRTHDAYS_TABLE,
      Key: { birthdayId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: updates.name !== undefined ? { '#name': 'name' } : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes as Birthday;
}

export async function deleteBirthday(birthdayId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: BIRTHDAYS_TABLE,
      Key: { birthdayId },
    })
  );
}

