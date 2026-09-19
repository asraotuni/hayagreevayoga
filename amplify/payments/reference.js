import { createHash } from 'node:crypto';
import { PAYMENT } from '../../payments/config.js';
export class PaymentError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function paymentRecord(event, now = new Date()) {
  const claims = event.requestContext?.authorizer?.jwt?.claims;
  if (!claims?.sub || claims.token_use !== 'id' || !claims.email || ![true, 'true'].includes(claims.email_verified)) {
    throw new PaymentError(401, 'Sign in with a verified email to submit your transaction reference.');
  }
  let input;
  try {
    if (event.isBase64Encoded || Buffer.byteLength(event.body || '') > 2048) throw new Error();
    input = JSON.parse(event.body || '{}');
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error();
  } catch { throw new PaymentError(400, 'Invalid payment details.'); }
  const reference = typeof input.reference === 'string' ? input.reference.trim().toUpperCase() : '';
  if (!/^[A-Z0-9-]{6,64}$/.test(reference)) throw new PaymentError(400, 'Enter the transaction number from your UPI app or bank (6–64 letters, numbers or hyphens).');
  if (input.paid !== true) throw new PaymentError(400, 'Confirm that you have completed your Google booking and payment.');
  return {
    id: `reference#${createHash('sha256').update(reference).digest('hex')}`,
    userId: claims.sub, email: claims.email, reference,
    amount: PAYMENT.amount, currency: PAYMENT.currency, upiId: PAYMENT.upiId,
    paymentStatus: 'AWAITING_REALIZATION', bookingStatus: 'USER_REPORTED_GOOGLE_BOOKING',
    submittedAt: now.toISOString(),
  };
}
export function createHandler({ save, configured = true, now = () => new Date() }) {
  return async event => {
    let statusCode = 200, body;
    try {
      const record = paymentRecord(event, now());
      if (!configured) throw new PaymentError(503, 'Transaction submission is not available yet. Your reference has not been saved. Please contact Chandrika.');
      const duplicate = await save(record);
      body = { status: 'saved', message: duplicate
        ? 'This transaction reference is already saved. Your appointment is subject to payment realization.'
        : 'Transaction reference received. Your appointment is subject to payment realization.' };
    } catch (error) {
      statusCode = error instanceof PaymentError ? error.status : 503;
      body = { message: error instanceof PaymentError ? error.message : 'We could not confirm your submission. Retry with the same reference; do not pay again.' };
    }
    return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) };
  };
}
