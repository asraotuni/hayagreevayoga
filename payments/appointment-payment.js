import { loadAuth, loadConfig } from '../auth/auth-client.js';
import { PAYMENT } from './config.js';
const form = document.querySelector('#payment-reference-form');
const status = document.querySelector('#payment-reference-status');
const submit = form.querySelector('[type="submit"]');
const reference = form.elements.reference;
document.querySelector('#upi-id').textContent = PAYMENT.upiId;
const copyButton = document.querySelector('#copy-upi');
const copyStatus = document.querySelector('#upi-copy-status');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(PAYMENT.upiId);
    copyStatus.textContent = 'Copied';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#upi-id'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'UPI ID selected — use your device’s Copy command.';
  }
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  reference.value = reference.value.trim();
  if (!form.reportValidity()) return;
  submit.disabled = true;
  status.textContent = 'Saving your transaction reference…';
  try {
    const client = await loadAuth(); const session = await client.fetchAuthSession();
    const token = session.tokens?.idToken;
    if (!token) throw new Error('Please sign in before submitting your transaction reference.');
    const config = await loadConfig();
    if (!config.custom?.paymentReferences?.endpoint) throw new Error('Transaction submission is not available yet. Your reference has not been saved. Please contact Chandrika.');
    const response = await fetch(`${config.custom.paymentReferences.endpoint}/payment-reference`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reference: reference.value, paid: form.elements.paid.checked }),
      signal: AbortSignal.timeout(20000),
    });
    let result;
    try { result = await response.json(); } catch { throw new Error('We could not confirm your submission. Retry with the same reference; do not pay again.'); }
    if (!response.ok) throw new Error(result.message || 'Unable to submit your reference. Please try again.');
    status.textContent = result.message;
    submit.textContent = 'Reference submitted';
    for (const field of form.elements) field.disabled = true;
  } catch (error) {
    status.textContent = error instanceof TypeError || error.name === 'TimeoutError'
      ? 'We could not confirm your submission. Retry with the same reference; do not pay again.' : error.message;
    submit.disabled = false;
  }
});
submit.disabled = false;
