import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createHandler } from './reference.js';
import { createSave } from './store.js';
const table = process.env.PAYMENT_TABLE;
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
export const handler = createHandler({ configured: Boolean(table), save: createSave(db, table) });
