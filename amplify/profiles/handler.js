import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createStore } from './store.js';
import { createHandler } from './service.js';
export const handler = createHandler(createStore(DynamoDBDocumentClient.from(new DynamoDBClient({})), process.env.PROFILE_TABLE));
