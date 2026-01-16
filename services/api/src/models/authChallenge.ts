import { docClient } from '../utils/dynamodb';
import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export type ChallengeType = 'magic_link' | 'otp';

export interface AuthChallenge {
  challengeId: string;
  email: string;
  type: ChallengeType;
  otpHash?: string;
  tokenHash?: string;
  expiresAt: number;
  consumedAt?: number;
  attempts: number;
  ip?: string;
  createdAt: number;
}

const AUTH_CHALLENGES_TABLE = process.env.AUTH_CHALLENGES_TABLE!;
const MAX_ATTEMPTS = 5;

export async function createChallenge(
  email: string,
  type: ChallengeType,
  hash: string,
  ttlMinutes: number,
  ip?: string
): Promise<AuthChallenge> {
  const now = Math.floor(Date.now() / 1000);
  const normalizedEmail = email.toLowerCase().trim();
  const challenge: AuthChallenge = {
    challengeId: uuidv4(),
    email: normalizedEmail,
    type,
    expiresAt: now + ttlMinutes * 60,
    attempts: 0,
    createdAt: now,
    ip,
  };

  if (type === 'otp') {
    challenge.otpHash = hash;
  } else {
    challenge.tokenHash = hash;
  }

  await docClient.send(
    new PutCommand({
      TableName: AUTH_CHALLENGES_TABLE,
      Item: challenge,
    })
  );

  return challenge;
}

export async function findValidChallenge(
  email: string,
  type: ChallengeType
): Promise<AuthChallenge | null> {
  const now = Math.floor(Date.now() / 1000);
  const normalizedEmail = email.toLowerCase().trim();
  
  console.log('Searching for challenge:', { 
    email: normalizedEmail, 
    type, 
    now,
    table: AUTH_CHALLENGES_TABLE 
  });
  
  const result = await docClient.send(
    new QueryCommand({
      TableName: AUTH_CHALLENGES_TABLE,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      FilterExpression: '#type = :type AND expiresAt > :now AND attribute_not_exists(consumedAt)',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':email': normalizedEmail,
        ':type': type,
        ':now': now,
      },
      Limit: 1,
      ScanIndexForward: false,
    })
  );

  console.log('Challenge query result:', {
    found: result.Items?.length || 0,
    items: result.Items?.map((item: any) => ({
      challengeId: item.challengeId,
      type: item.type,
      expiresAt: item.expiresAt,
      consumedAt: item.consumedAt,
      createdAt: item.createdAt,
    }))
  });

  return result.Items?.[0] as AuthChallenge | null;
}

export async function markChallengeConsumed(challengeId: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await docClient.send(
    new UpdateCommand({
      TableName: AUTH_CHALLENGES_TABLE,
      Key: { challengeId },
      UpdateExpression: 'SET consumedAt = :consumedAt',
      ExpressionAttributeValues: {
        ':consumedAt': now,
      },
    })
  );
}

export async function incrementChallengeAttempts(challengeId: string): Promise<number> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: AUTH_CHALLENGES_TABLE,
      Key: { challengeId },
      UpdateExpression: 'ADD attempts :inc',
      ExpressionAttributeValues: {
        ':inc': 1,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  return (result.Attributes as AuthChallenge).attempts;
}

export function isMaxAttemptsReached(attempts: number): boolean {
  return attempts >= MAX_ATTEMPTS;
}


