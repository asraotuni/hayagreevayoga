import { access, copyFile, mkdir, rm } from 'node:fs/promises';
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
for (const directory of ['payments', 'auth', 'profile', 'yoga-therapy', 'carnatic-music', 'astrology', 'yoga-therapy/testimonials', 'carnatic-music/testimonials', 'astrology/testimonials']) {
  await mkdir(new URL(`../dist/${directory}/`, import.meta.url), { recursive: true });
}
for (const file of ['payments/config.js', 'payments/appointment-payment.js', 'payments/upi-qr.svg', 'index.html', 'styles.css', 'services.css', 'app.js', 'auth/auth-client.js', 'profile/profile.js', 'profile/index.html', 'yoga-therapy/index.html', 'carnatic-music/index.html', 'astrology/index.html', 'yoga-therapy/testimonials/index.html', 'carnatic-music/testimonials/index.html', 'astrology/testimonials/index.html']) {
  await copyFile(new URL(`../${file}`, import.meta.url), new URL(`../dist/${file}`, import.meta.url));
}
try {
  await access(new URL('../amplify_outputs.json', import.meta.url));
  await copyFile(new URL('../amplify_outputs.json', import.meta.url), new URL('../dist/amplify_outputs.json', import.meta.url));
} catch {
  // Local previews without a deployed backend intentionally omit auth config.
}
// Remove obsolete root scripts from builds made before the auth file reorganization.
for (const file of ['auth-client.js', 'profile.js', 'appointments/booking.js']) {
  await rm(new URL(`../dist/${file}`, import.meta.url), { force: true });
}
console.log('Static site built in dist/');
