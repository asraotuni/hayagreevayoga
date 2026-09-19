import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { PAYMENT, UPI_URI } from '../payments/config.js';

test('published QR encodes the exact UPI payee and fixed INR fee', async () => {
  const options = { type: 'svg', errorCorrectionLevel: 'M', margin: 4, width: 280 };
  const svg = await readFile(new URL('../payments/upi-qr.svg', import.meta.url), 'utf8');
  assert.equal(svg.slice(svg.indexOf('<svg')), await QRCode.toString(UPI_URI, options));
  const png = PNG.sync.read(await QRCode.toBuffer(UPI_URI, { ...options, type: 'png' }));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.equal(decoded.data, UPI_URI);
  const uri = new URL(decoded.data);
  assert.equal(uri.searchParams.get('pa'), PAYMENT.upiId);
  assert.equal(uri.searchParams.get('am'), '2000.00'); assert.equal(uri.searchParams.get('cu'), 'INR');
});
