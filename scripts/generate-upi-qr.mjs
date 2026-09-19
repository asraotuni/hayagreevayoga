import QRCode from 'qrcode';
import { UPI_URI } from '../payments/config.js';
await QRCode.toFile(new URL('../payments/upi-qr.svg', import.meta.url).pathname, UPI_URI, {
  type: 'svg', errorCorrectionLevel: 'M', margin: 4, width: 280,
});
console.log('Generated UPI QR for the configured payee and fee.');
