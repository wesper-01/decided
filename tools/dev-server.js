// Local server for the built web app: serves app/ at http://localhost:4819, plus /__icons, a page that
// draws the app icons from the Lucide check in decided.html and saves them into app/icons/.
// Run: npm run dev   (or: node tools/dev-server.js [app dir] [decided.html] [port])
const http = require('http'), fs = require('fs'), path = require('path');
const here = path.join(__dirname, '..');
const [ROOT = path.join(here, 'app'), APP = path.join(here, 'decided.html'), PORT = 4819] = process.argv.slice(2);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.json': 'application/json', '.md': 'text/markdown' };
const mark = fs.readFileSync(APP, 'utf8').match(/'check': '([^']*)'/)[1];
const paths = [...mark.matchAll(/d="([^"]+)"/g)].map(m => m[1]);
const iconPage = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#888">
<script>
const PATHS = ${JSON.stringify(paths)};
function draw(n) {
  const c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d');
  // Brand gradient at 135deg, then the same top sheen as the in-app brand mark.
  let gr = g.createLinearGradient(0, 0, n, n); gr.addColorStop(0, '#0E9A6F'); gr.addColorStop(1, '#0B7F5C'); g.fillStyle = gr; g.fillRect(0, 0, n, n);
  gr = g.createLinearGradient(0, 0, 0, n); gr.addColorStop(0, 'rgba(255,255,255,.30)'); gr.addColorStop(.55, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, n, n);
  // The check from Lucide, white and heavier than in the UI, half the icon, optically centred.
  const s = n * 0.5 / 24; g.save(); g.translate(n / 2 - 12 * s, n / 2 - 12 * s + n * 0.01); g.scale(s, s);
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const p of PATHS) g.stroke(new Path2D(p)); g.restore();
  return c;
}
(async () => {
  const out = [];
  for (const [name, n] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512]]) {
    const c = draw(n); document.body.append(c); c.style.margin = '8px';
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    const res = await fetch('/__save?name=' + name, { method: 'POST', body: blob }); out.push(name + ' ' + blob.size + ' ' + res.status);
  }
  document.title = 'done: ' + out.join(', ');
})();
</script>`;
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/__icons') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(iconPage); }
  if (u.pathname === '/__save' && req.method === 'POST') {
    const name = u.searchParams.get('name') || '';
    if (!/^[a-z0-9-]+\.png$/.test(name)) { res.writeHead(400); return res.end('bad name'); }
    const chunks = []; req.on('data', c => chunks.push(c)); req.on('end', () => {
      fs.mkdirSync(path.join(ROOT, 'icons'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'icons', name), Buffer.concat(chunks)); res.writeHead(200); res.end('ok');
    });
    return;
  }
  let p = decodeURIComponent(u.pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' }); res.end(data);
  });
}).listen(+PORT, () => console.log('Decided at http://localhost:' + PORT + '  (icons: /__icons)'));
