import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentRecord, createHandler } from '../amplify/payments/reference.js';
import { createSave } from '../amplify/payments/store.js';
function event(body = {}, claims = {}) {
  return { requestContext: { authorizer: { jwt: { claims: {
    sub: 'user-a', email: 'member@example.com', email_verified: true, token_use: 'id', ...claims,
  } } } }, body: JSON.stringify({ reference: '123456789012', paid: true, ...body }) };
}
test('stores authenticated identity, configured amount, and unverified payment status', () => {
  const r = paymentRecord(event({ email: 'wrong@example.com', amount: 1 }));
  assert.equal(r.email, 'member@example.com'); assert.equal(r.amount, 2000);
  assert.equal(r.upiId, 'chsaripalli@okicici'); assert.equal(r.paymentStatus, 'AWAITING_REALIZATION');
  assert.equal(r.bookingStatus, 'USER_REPORTED_GOOGLE_BOOKING');
});
test('rejects missing/unverified identity and invalid reference or attestation', () => {
  for (const claims of [{ sub: '' }, { email: '' }, { email_verified: false }, { token_use: 'access' }]) assert.throws(() => paymentRecord(event({}, claims)), { status: 401 });
  for (const body of [{ reference: ' ' }, { reference: '<script>' }, { reference: 'a'.repeat(65) }, { paid: false }]) assert.throws(() => paymentRecord(event(body)), { status: 400 });
  for (const body of ['null', '[]', '{', 'x'.repeat(2049)]) assert.throws(() => paymentRecord({ ...event(), body }), { status: 400 });
});
test('normalizes references for duplicate detection', () => {
  assert.equal(paymentRecord(event({ reference: ' abc-123 ' })).id, paymentRecord(event({ reference: 'ABC-123' })).id);
});
test('acknowledges saved or repeated references without claiming payment realization or emailing', async () => {
  for (const duplicate of [false, true]) {
    let saved = false;
    const handler = createHandler({ save: async () => { saved = true; return duplicate; } });
    const response = await handler(event()); assert.equal(response.statusCode, 200); assert(saved);
    const body = JSON.parse(response.body); assert.equal(body.status, 'saved');
    assert.match(body.message, /subject to payment realization/); assert.doesNotMatch(body.message, /email.*sent/i);
  }
});
test('configuration and storage failures never claim that a reference was saved', async () => {
  const absent = await createHandler({ configured: false, save: async () => assert.fail('must not save') })(event());
  assert.equal(absent.statusCode, 503); assert.match(absent.body, /not been saved/);
  const failure = await createHandler({ save: async () => { throw new Error('Dynamo unavailable'); } })(event());
  assert.equal(failure.statusCode, 503); assert.match(failure.body, /same reference/);
});
test('atomic storage handles concurrent repeats and rejects use by another account', async () => {
  const rows = new Map(); const commands = [];
  const db = { async send(command) {
    const data = command.input; commands.push(data);
    if (data.Key) return { Item: rows.get(data.Key.id) };
    const item = data.TransactItems[0].Put.Item;
    if (rows.has(item.id)) { const error = new Error(); error.name = 'TransactionCanceledException'; throw error; }
    rows.set(item.id, item); return {};
  } };
  const save = createSave(db, 'table'); const record = paymentRecord(event());
  const results = await Promise.all([save(record), save(record)]);
  assert.deepEqual(results.sort(), [false, true]); assert.equal(rows.size, 1);
  await assert.rejects(save({ ...record, userId: 'another-user' }), { status: 409 });
  const transaction = commands.find(c => c.TransactItems);
  assert.equal(transaction.TransactItems[0].Put.ConditionExpression, 'attribute_not_exists(id)');
  assert.equal(transaction.TransactItems[1].Update.ExpressionAttributeValues[':limit'], 5);
});
test('storage reports submission quota separately from transient database failures', async () => {
  const save = createSave({ async send(command) {
    if (command.input.Key) return {};
    const error = new Error(); error.name = 'TransactionCanceledException';
    error.CancellationReasons = [{ Code: 'None' }, { Code: 'ConditionalCheckFailed' }]; throw error;
  } }, 'table');
  await assert.rejects(save(paymentRecord(event())), { status: 429 });
});
