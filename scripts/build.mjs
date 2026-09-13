import { mkdir, copyFile } from 'node:fs/promises';
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
for (const directory of ['yoga-therapy', 'carnatic-music', 'astrology', 'yoga-therapy/testimonials', 'carnatic-music/testimonials', 'astrology/testimonials']) {
  await mkdir(new URL(`../dist/${directory}/`, import.meta.url), { recursive: true });
}
for (const file of ['index.html', 'styles.css', 'services.css', 'app.js', 'yoga-therapy/index.html', 'carnatic-music/index.html', 'astrology/index.html', 'yoga-therapy/testimonials/index.html', 'carnatic-music/testimonials/index.html', 'astrology/testimonials/index.html']) {
  await copyFile(new URL(`../${file}`, import.meta.url), new URL(`../dist/${file}`, import.meta.url));
}
console.log('Static site built in dist/');
