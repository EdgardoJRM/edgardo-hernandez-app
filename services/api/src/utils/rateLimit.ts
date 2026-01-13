import { docClient } from './dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const RATE_LIMIT_TABLE = 'rate-limits';
const MAX_REQUESTS = 5;
const WINDOW_MINUTES = 10;

export async function checkRateLimit(
  key: string,
  maxRequests: number = MAX_REQUESTS,
  windowMinutes: number = WINDOW_MINUTES
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowMinutes * 60;
  const itemKey = `rate_limit_${key}_${Math.floor(now / (windowMinutes * 60))}`;

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: RATE_LIMIT_TABLE,
        Key: { key: itemKey },
      })
    );

    const count = result.Item?.count || 0;
    if (count >= maxRequests) {
      return false;
    }

    await docClient.send(
      new PutCommand({
        TableName: RATE_LIMIT_TABLE,
        Item: {
          key: itemKey,
          count: count + 1,
          ttl: now + windowMinutes * 60,
        },
      })
    );

    return true;
  } catch (error) {
    // If table doesn't exist in local dev, allow request
    console.warn('Rate limit check failed:', error);
    return true;
  }
}

