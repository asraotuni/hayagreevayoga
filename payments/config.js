// Public payment details. The server also uses these values for reference records.
export const PAYMENT = Object.freeze({
  upiId: 'chsaripalli@okicici',
  payeeName: 'Hayagreeva',
  amount: 2000,
  currency: 'INR',
});
export const UPI_URI = `upi://pay?pa=${encodeURIComponent(PAYMENT.upiId)}&pn=${encodeURIComponent(PAYMENT.payeeName)}&am=${PAYMENT.amount.toFixed(2)}&cu=${PAYMENT.currency}`;
