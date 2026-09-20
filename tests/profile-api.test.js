import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../amplify/profiles/service.js';
import { createStore } from '../amplify/profiles/store.js';
const data = { firstName: 'Test', lastName: 'Person', mobile: '00123', addressLine1: 'One', addressLine2: '', addressLine3: '', country: 'India', state: 'Karnataka', pin: '012345', birthdate: '2000-01-02' };
const event = (method, body = data, sub = 'user-a') => ({ requestContext: { http: { method }, authorizer: { jwt: { claims: { sub, email: 'test@example.com', email_verified: true, token_use: 'id' } } } }, body: JSON.stringify(body) });
test('GET is owner scoped and returns no service access flags', async () => {
  const handler = createHandler({ get: async uuid => { assert.equal(uuid, 'user-b'); return { uuid, ...data, yogaTherapy: true }; } });
  const response = await handler(event('GET', {}, 'user-b'));
  assert.equal(response.statusCode, 200);
  const { profile } = JSON.parse(response.body);
  assert.equal(profile.uuid, 'user-b'); assert.equal(profile.yogaTherapy, undefined);
});
test('missing profile is distinct from storage failure', async () => {
  assert.deepEqual(JSON.parse((await createHandler({ get: async () => undefined })(event('GET'))).body), { profile: null });
  assert.equal((await createHandler({ get: async () => { throw Error(); } })(event('GET'))).statusCode, 503);
});
test('rejects unauthenticated requests, forged identity and admin flags', async () => {
  const handler = createHandler({ save: () => assert.fail('must not write') });
  assert.equal((await handler({})).statusCode, 401);
  for (const extra of [{uuid:'other'}, {email:'other@example.com'}, {yogaTherapy:true}, {classicalMusic:false}, {astrology:true}]) {
    assert.equal((await handler(event('PUT', {...data,...extra}))).statusCode, 400);
  }
  const wrongToken = event('GET'); wrongToken.requestContext.authorizer.jwt.claims.token_use = 'access';
  assert.equal((await handler(wrongToken)).statusCode, 401);
});
test('validates shape, names, date and length before saving', async () => {
  const handler = createHandler({ save: () => assert.fail('must not write') });
  for (const body of [null, [], {...data,firstName:' '}, {...data,mobile:123}, {...data,birthdate:'2020-02-30'}, {...data,addressLine1:'a'.repeat(301)}]) {
    assert.equal((await handler(event('PUT',body))).statusCode,400);
  }
});
test('save derives identity/email from token and preserves string values', async () => {
  const handler = createHandler({ save: async (uuid,email,input,flags) => {
    assert.equal(uuid,'user-a'); assert.equal(email,'test@example.com');
    assert.equal(input.pin,'012345'); assert.equal(input.mobile,'00123');
    assert.equal(flags.length,3); return {uuid,...input};
  } });
  assert.equal((await handler(event('PUT'))).statusCode,200);
});
test('store uses atomic update, preserving existing admin flags and unrelated attributes', async () => {
  const commands = [];
  const store = createStore({send: async command => { commands.push(command.input); return {Attributes:{uuid:'user-a'}}; }}, 'hayagreeva-dev');
  await store.save('user-a','test@example.com',data,['yogaTherapy','classicalMusic','astrology']);
  const update = commands[0];
  assert.deepEqual(update.Key,{uuid:'user-a'});
  for (const flag of ['yogaTherapy','classicalMusic','astrology']) assert.ok(update.UpdateExpression.includes(`#${flag} = if_not_exists(#${flag}, :disabled)`));
  assert.equal(update.ExpressionAttributeValues[':disabled'],false);
  await store.get('user-b');
  assert.deepEqual(commands[1].Key,{uuid:'user-b'}); assert.equal(commands[1].ConsistentRead,true);
});
