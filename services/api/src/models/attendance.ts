import { docClient } from '../utils/dynamodb';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Attendance {
  attendanceId: string;
  userId: string;
  qrCode: string; // Código QR único del usuario
  checkInTime: number;
  checkOutTime?: number;
  location?: string;
  notes?: string;
  createdAt: number;
}

const ATTENDANCE_TABLE = process.env.ATTENDANCE_TABLE!;

export async function getAttendanceById(attendanceId: string): Promise<Attendance | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: ATTENDANCE_TABLE,
      Key: { attendanceId },
    })
  );
  return result.Item as Attendance | null;
}

export async function getAttendanceByUser(userId: string, startDate?: number, endDate?: number): Promise<Attendance[]> {
  let keyCondition = 'userId = :userId';
  const expressionAttributeValues: Record<string, any> = {
    ':userId': userId,
  };

  if (startDate && endDate) {
    keyCondition += ' AND checkInTime BETWEEN :startDate AND :endDate';
    expressionAttributeValues[':startDate'] = startDate;
    expressionAttributeValues[':endDate'] = endDate;
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: ATTENDANCE_TABLE,
      IndexName: 'userId-checkInTime-index',
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
  return (result.Items || []) as Attendance[];
}

export async function getAttendanceByQrCode(qrCode: string): Promise<Attendance | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: ATTENDANCE_TABLE,
      IndexName: 'qrCode-index',
      KeyConditionExpression: 'qrCode = :qrCode',
      ExpressionAttributeValues: {
        ':qrCode': qrCode,
      },
      Limit: 1,
    })
  );
  return (result.Items?.[0] || null) as Attendance | null;
}

export async function getTodayAttendance(): Promise<Attendance[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfDay = tomorrow.getTime();

  const result = await docClient.send(
    new ScanCommand({
      TableName: ATTENDANCE_TABLE,
      FilterExpression: 'checkInTime BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':start': startOfDay,
        ':end': endOfDay,
      },
    })
  );
  return (result.Items || []) as Attendance[];
}

export async function createAttendance(attendance: Omit<Attendance, 'attendanceId' | 'createdAt'>): Promise<Attendance> {
  const now = Date.now();
  const newAttendance: Attendance = {
    ...attendance,
    attendanceId: uuidv4(),
    createdAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: ATTENDANCE_TABLE,
      Item: newAttendance,
    })
  );
  return newAttendance;
}

export async function checkOut(attendanceId: string, checkOutTime: number, notes?: string): Promise<Attendance> {
  const updateExpressions: string[] = ['checkOutTime = :checkOutTime'];
  const expressionAttributeValues: Record<string, any> = {
    ':checkOutTime': checkOutTime,
  };

  if (notes !== undefined) {
    updateExpressions.push('notes = :notes');
    expressionAttributeValues[':notes'] = notes;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: ATTENDANCE_TABLE,
      Key: { attendanceId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes as Attendance;
}

