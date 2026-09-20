import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
export function createStore(db, table) {
  return {
    async get(uuid) {
      return (await db.send(new GetCommand({ TableName: table, Key: { uuid }, ConsistentRead: true }))).Item;
    },
    async save(uuid, email, input, flags) {
      const names = {}, values = {}, updates = [];
      for (const [key, value] of Object.entries({ ...input, email })) {
        names[`#${key}`] = key; values[`:${key}`] = value;
        updates.push(`#${key} = :${key}`);
      }
      values[':disabled'] = false;
      for (const flag of flags) {
        names[`#${flag}`] = flag;
        updates.push(`#${flag} = if_not_exists(#${flag}, :disabled)`);
      }
      return (await db.send(new UpdateCommand({ TableName: table, Key: { uuid },
        UpdateExpression: `SET ${updates.join(', ')}`, ExpressionAttributeNames: names,
        ExpressionAttributeValues: values, ReturnValues: 'ALL_NEW',
      }))).Attributes;
    },
  };
}
