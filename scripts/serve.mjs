import http from 'node:http';
import { readFile } from 'node:fs/promises';
const port = Number(process.env.PORT || 3000);
const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/styles.css': ['styles.css', 'text/css'], '/app.js': ['app.js', 'text/javascript'], '/auth-client.js': ['auth-client.js', 'text/javascript'], '/profile.js': ['profile.js', 'text/javascript'], '/amplify_outputs.json': ['amplify_outputs.json', 'application/json'] };
files['/services.css'] = ['services.css', 'text/css'];
for (const section of ['profile', 'yoga-therapy', 'carnatic-music', 'astrology', 'yoga-therapy/testimonials', 'carnatic-music/testimonials', 'astrology/testimonials']) {
  for (const suffix of ['', '/', '/index.html']) {
    files[`/${section}${suffix}`] = [`${section}/index.html`, 'text/html'];
  }
}
http.createServer(async (req, res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const body = await readFile(new URL(`../${file[0]}`, import.meta.url));
    res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(500); res.end('Unable to load page'); }
}).listen(port, '127.0.0.1', () => console.log(`Yoga portal: http://localhost:${port}`));
