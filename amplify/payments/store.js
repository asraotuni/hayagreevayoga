import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { PaymentError } from './reference.js';
export function createSave(db, table) {
  const existing = async record => {
    const { Item } = await db.send(new GetCommand({ TableName: table, Key: { id: record.id }, ConsistentRead: true }));
    if (!Item) return false;
    if (Item.userId !== record.userId) throw new PaymentError(409, 'This reference has already been submitted. Please contact Chandrika if you need help.');
    return true;
  };
  return async record => {
    if (await existing(record)) return true;
    try {
      await db.send(new TransactWriteCommand({ TransactItems: [
        { Put: { TableName: table, Item: record, ConditionExpression: 'attribute_not_exists(id)' } },
        { Update: { TableName: table, Key: { id: `daily#${record.userId}#${record.submittedAt.slice(0, 10)}` },
          UpdateExpression: 'SET expiresAt = :ttl ADD submissions :one',
          ConditionExpression: 'attribute_not_exists(submissions) OR submissions < :limit',
          ExpressionAttributeValues: { ':ttl': Math.floor(Date.parse(record.submittedAt) / 1000) + 172800, ':one': 1, ':limit': 5 } } },
      ] }));
      return false;
    } catch (error) {
      if (error.name !== 'TransactionCanceledException') throw error;
      if (await existing(record)) return true;
      if (error.CancellationReasons?.[1]?.Code === 'ConditionalCheckFailed') throw new PaymentError(429, 'The daily submission limit has been reached. Please contact Chandrika.');
      throw error;
    }
  };
}
