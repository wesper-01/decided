// Draws the README images in docs/ from the real app: walks the quick start in headless Chrome, screenshots
// each screen at phone size in light and dark, then lays the shots out on the emerald-mist backdrop in the
// app's own fonts and colours. Needs Chrome or Edge (set CHROME to its path if it is not found).
// Run: npm run images
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const here = path.join(__dirname, '..'), OUT = path.join(here, 'docs'), PORT = 4821, DEBUG = 9333;
const APP = fs.readFileSync(path.join(here, 'decided.html'), 'utf8');

const CHROME = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => p && fs.existsSync(p));
if (!CHROME) { console.error('Chrome not found. Set CHROME to its path.'); process.exit(1); }

// Theme tokens and the grain tile come straight from the app, so the images can never drift from it.
const tokens = block => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
const LIGHT = tokens(APP.split(':root {')[1].split('}')[0]);
const DARK = { ...LIGHT, ...tokens(APP.split(':root[data-theme="dark"] {')[1].split('}')[0]) };
const GRAIN = APP.match(/\.backdrop::after \{[^}]*background-image: (url\("[^"]+"\))/)[1];
const CHECK = APP.match(/'check': '([^']*)'/)[1];

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function cdp() {
  for (let n = 0; n < 50; n++) { try { const v = await (await fetch(`http://127.0.0.1:${DEBUG}/json/version`)).json(); if (v) break; } catch { await sleep(200); } }
  const tab = await (await fetch(`http://127.0.0.1:${DEBUG}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const wait = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (wait.has(m.id)) { const [ok, no] = wait.get(m.id); wait.delete(m.id); m.error ? no(new Error(m.error.message)) : ok(m.result); } };
  const send = (method, params = {}) => new Promise((ok, no) => { wait.set(++id, [ok, no]); ws.send(JSON.stringify({ id, method, params })); });
  const run = async code => { const r = await send('Runtime.evaluate', { expression: `(async () => { ${code} })()`, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || code); return r.result.value; };
  const open = async url => { await send('Page.navigate', { url }); await sleep(400); await run(`await new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r)); await document.fonts.ready;`); };
  const size = (width, height, scale = 2, mobile = false) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile });
  const theme = dark => send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
  const shot = async () => (await send('Page.captureScreenshot', { format: 'png' })).data;
  await send('Page.enable');
  return { send, run, open, size, theme, shot, close: () => ws.close() };
}

// The quick start answered as a new user would, then a few days of use: one meal eaten, a month of weigh-ins.
async function phoneShots(b, dark) {
  const url = `http://localhost:${PORT}/`, s = {};
  await b.size(390, 844, 2, true); await b.theme(dark);
  await b.open(url); await b.run(`localStorage.clear(); navigator.serviceWorker?.getRegistrations().then(rs => rs.forEach(r => r.unregister()));`);
  await b.open(url + '?fresh=' + Date.now() + '#today'); // a new query string, so it reloads instead of only changing the hash
  const settle = async () => { await b.run(`if (!document.getElementById('shots')) document.head.insertAdjacentHTML('beforeend', '<style id="shots">.toast { display: none !important; }</style>'); scrollTo(0, 0); await document.fonts.ready;`); await sleep(900); };
  await b.run(`ui.qs.goal = 'cut'; render();`); await settle(); s.goal = await b.shot();
  await b.run(`Object.assign(ui.qs, { step: 2, sex: 'f', age: '31', ft: '5', inch: '7', w: '162' }); render();`); await settle(); s.body = await b.shot();
  await b.run(`Object.assign(ui.qs, { step: 3, diet: 'any', avoid: ['nuts'] }); render();`); await settle(); s.diet = await b.shot();
  await b.run(`qsFinish();
    const kg = state.weights[TODAY()]; delete state.weights[TODAY()];
    [[-28, 1.9], [-24, 1.6], [-21, 1.7], [-17, 1.2], [-14, 1.0], [-10, 0.8], [-7, 0.5], [-3, 0.2], [0, 0]].forEach(([d, x]) => state.weights[addDays(TODAY(), d)] = Math.round((kg + x) * 10) / 10);
    save('weights'); document.querySelector('[data-act="next-eat"]')?.click();`);
  for (const t of ['today', 'plan', 'groceries', 'progress']) { await b.run(`setTab('${t}');`); await settle(); s[t] = await b.shot(); }
  return s;
}

// Shared look for the composed images: the app's tokens, mist fields and grain, Bricolage Grotesque and Figtree.
const page = (t, w, h, body, css = '') => `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Figtree:wght@400;500;600;700;800&display=swap">
<style>
:root { ${Object.entries(t).map(([k, v]) => `--${k}: ${v};`).join(' ')} }
* { box-sizing: border-box; margin: 0; }
html, body { width: ${w}px; height: ${h}px; overflow: hidden; }
body { position: relative; font-family: var(--font-body); color: var(--ink); background: var(--bg); -webkit-font-smoothing: antialiased; }
.mist { position: absolute; inset: 0; z-index: -1; background:
  radial-gradient(60% 75% at 12% 18%, var(--blob-1), transparent 70%), radial-gradient(45% 60% at 88% 14%, var(--blob-2), transparent 70%),
  radial-gradient(55% 70% at 78% 92%, var(--blob-3), transparent 70%), radial-gradient(40% 50% at 30% 95%, var(--blob-5), transparent 72%),
  radial-gradient(50% 60% at 52% 50%, var(--blob-4), transparent 75%), var(--bg); }
.mist::after { content: ""; position: absolute; inset: 0; opacity: var(--grain); mix-blend-mode: overlay; background-image: ${GRAIN}; background-size: 180px 180px; }
.display { font-family: var(--font-display); font-weight: 750; letter-spacing: -0.035em; }
.muted { color: var(--muted); }
.mark { display: grid; place-items: center; border-radius: 50%; color: var(--accent-ink); background: linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 55%), linear-gradient(135deg, var(--accent), var(--accent-2)); box-shadow: inset 0 1px 0 rgba(255,255,255,.55), 0 10px 24px -10px var(--accent); }
.mark svg { width: 56%; height: 56%; fill: none; stroke: currentColor; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.glass { background: var(--sheen), var(--glass); border: 1px solid var(--rim-b); box-shadow: inset 0 1px 0 var(--rim-a), var(--shadow); backdrop-filter: blur(20px) saturate(1.4); }
.phone { border-radius: 30px; padding: 6px; }
.phone img { display: block; width: 100%; border-radius: 24px; }
.eyebrow { font-size: 12px; font-weight: 750; letter-spacing: .09em; text-transform: uppercase; color: color-mix(in srgb, var(--accent) 85%, var(--ink)); }
${css}
</style><body><div class="mist"></div>${body}`;
const img = b64 => `<img src="data:image/png;base64,${b64}" alt="">`;
const mark = n => `<span class="mark" style="width:${n}px;height:${n}px"><svg viewBox="0 0 24 24">${CHECK}</svg></span>`;

const banner = (t, s) => page(t, 880, 400, `
  <div class="copy">
    <div class="brand">${mark(46)}<span class="display word">decided<span style="color:var(--accent)">.</span></span></div>
    <h1 class="display">Stop deciding.<br>Start changing.</h1>
    <p class="muted">Three questions, then your calories, meals and groceries are decided. Free, open source, and private to your device.</p>
  </div>
  <div class="glass phone p1">${img(s.today)}</div><div class="glass phone p2">${img(s.plan)}</div>`, `
  .copy { position: absolute; left: 52px; top: 58px; width: 400px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .word { font-size: 30px; }
  h1 { margin-top: 38px; font-size: 52px; line-height: .98; letter-spacing: -0.045em; }
  .copy p { margin-top: 20px; font-size: 16.5px; line-height: 1.5; font-weight: 500; max-width: 360px; }
  .phone { position: absolute; width: 214px; }
  .p1 { left: 618px; top: 46px; z-index: 2; }
  .p2 { left: 478px; top: 92px; opacity: .92; }`);

const strip = (t, shots, cols) => page(t, 880, cols.length === 3 ? 568 : 528, `
  <div class="row">${cols.map(([k, name, line]) => `<figure><div class="glass phone">${img(shots[k])}</div><figcaption><b class="display">${name}</b><span class="muted">${line}</span></figcaption></figure>`).join('')}</div>`, `
  .row { position: absolute; inset: 40px 36px 0; display: grid; grid-template-columns: repeat(${cols.length}, 1fr); gap: ${cols.length === 3 ? 40 : 22}px; align-items: start; }
  figure { display: grid; gap: 16px; ${cols.length === 3 ? 'padding: 0 18px;' : ''} }
  figcaption { display: grid; gap: 3px; text-align: center; }
  figcaption b { font-size: 18px; } figcaption span { font-size: 13.5px; font-weight: 500; line-height: 1.4; }`);

const SWATCHES = [['accent', 'Emerald', 'Actions, progress, the mark'], ['accent-2', 'Sea glass', 'Second stop of every gradient'], ['ink', 'Ink', 'Text'], ['muted', 'Muted', 'Secondary text'],
  ['prot', 'Protein', 'Macro colour'], ['carb', 'Carbs', 'Macro colour'], ['fat', 'Fat', 'Macro colour'], ['blob-1', 'Mist', 'Main backdrop field']];
const look = t => page(t, 880, 420, `
  <div class="glass card type">
    <div class="eyebrow">Display</div><div class="display aa">Aa</div><b class="display name">Bricolage Grotesque</b><span class="muted">Headings, numbers, the wordmark. Weight 750, tight tracking.</span>
    <div class="eyebrow" style="margin-top:22px">Body</div><b class="body">Figtree</b><span class="muted">Everything you read. Weights 500 to 750.</span>
  </div>
  <div class="glass card sw">
    <div class="eyebrow">Palette</div>
    <div class="grid">${SWATCHES.map(([k, n, u]) => `<div class="s"><i style="background:var(--${k})"></i><div><b>${n}</b><code>${t[k].toUpperCase()}</code><span class="muted">${u}</span></div></div>`).join('')}</div>
  </div>`, `
  .card { position: absolute; top: 36px; bottom: 36px; border-radius: 28px; padding: 28px; display: flex; flex-direction: column; }
  .type { left: 36px; width: 300px; gap: 4px; }
  .aa { font-size: 92px; line-height: 1; margin: 6px 0 4px; letter-spacing: -0.05em; }
  .type .name { font-size: 20px; } .type .body { font-size: 20px; font-weight: 700; margin-top: 4px; }
  .type span { font-size: 13.5px; line-height: 1.45; font-weight: 500; }
  .sw { left: 352px; right: 36px; gap: 18px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 18px; }
  .s { display: flex; gap: 12px; align-items: center; }
  .s i { width: 44px; height: 44px; border-radius: 14px; flex: none; box-shadow: inset 0 0 0 1px var(--line), inset 0 1px 0 rgba(255,255,255,.35); }
  .s div { display: grid; gap: 1px; } .s b { font-size: 14.5px; }
  .s code { font: 600 12px/1.3 ui-monospace, "Cascadia Mono", Menlo, monospace; color: var(--ink); opacity: .8; }
  .s span { font-size: 12px; }`);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn(process.execPath, [path.join(here, 'tools/dev-server.js'), path.join(here, 'app'), path.join(here, 'decided.html'), String(PORT)], { stdio: 'ignore' });
  const profile = fs.mkdtempSync(path.join(require('os').tmpdir(), 'decided-shots-'));
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${DEBUG}`, `--user-data-dir=${profile}`, '--lang=en-US', '--hide-scrollbars', '--no-first-run', '--enable-unsafe-swiftshader'], { stdio: 'ignore' });
  try {
    const b = await cdp();
    for (const [name, t, dark] of [['light', LIGHT, false], ['dark', DARK, true]]) {
      const s = await phoneShots(b, dark);
      const pages = {
        banner: banner(t, s),
        'quick-start': strip(t, s, [['goal', 'What do you want?', 'One goal. No plan to write.'], ['body', 'Your body', 'Sets calories and protein.'], ['diet', 'How you eat', 'Only recipes that fit.']]),
        screens: strip(t, s, [['today', 'Today', 'The one meal to eat next.'], ['plan', 'Plan', 'A week, portioned to you.'], ['groceries', 'Groceries', 'What to buy and the cost.'], ['progress', 'Progress', 'Trend, streaks, real maintenance.']]),
        look: look(t),
      };
      await b.theme(dark);
      for (const [file, html] of Object.entries(pages)) {
        const [, w, h] = html.match(/html, body \{ width: (\d+)px; height: (\d+)px/);
        const tmp = path.join(profile, file + '.html'); fs.writeFileSync(tmp, html);
        await b.size(+w, +h, 2); await b.open('file:///' + tmp.replace(/\\/g, '/')); await sleep(300);
        const data = (await b.send('Page.captureScreenshot', { format: 'webp', quality: 90 })).data; // webp keeps the grain sharp at a fraction of PNG's size
        fs.writeFileSync(path.join(OUT, `${file}-${name}.webp`), Buffer.from(data, 'base64')); console.log(`wrote docs/${file}-${name}.webp`);
      }
    }
    b.close();
  } finally { chrome.kill(); server.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
