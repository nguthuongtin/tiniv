// Mininal Debug Server Node.js fallback
const http = require('http');
const fs = require('fs');
const path = require('path');

const SESSION_ID = process.env.SESSION_ID || 'quan-tri-tab-bugs';
const PORT = parseInt(process.env.PORT || '7777', 10);
const OUT_DIR = path.resolve(__dirname);
const LOG_FILE = path.join(OUT_DIR, `trae-debug-log-${SESSION_ID}.ndjson`);
const ENV_FILE = path.join(OUT_DIR, `${SESSION_ID}.env`);

if (process.env.CLEAN === '1') {
  try { if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE); } catch {}
}
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(ENV_FILE, `DEBUG_SERVER_URL=http://127.0.0.1:${PORT}/event\nDEBUG_SESSION_ID=${SESSION_ID}\n`);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.url === '/health') {
    let cnt = 0;
    try { if (fs.existsSync(LOG_FILE)) cnt = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(l => l.trim()).length; } catch {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, logs: cnt, uptime: Date.now() }));
    return;
  }
  if (req.url === '/logs' && req.method === 'GET') {
    let lines = [];
    try { if (fs.existsSync(LOG_FILE)) lines = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(l => l.trim()); } catch {}
    const lastN = parseInt(new URL('http://localhost' + (req.url || '')).searchParams.get('last') || String(lines.length), 10);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(lines.slice(-lastN).map(l => { try { return JSON.parse(l); } catch { return l; } })));
    return;
  }
  if (req.url === '/logs' && req.method === 'DELETE') {
    try { if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE); } catch {}
    res.writeHead(200); res.end('ok');
    return;
  }
  if (req.url === '/event' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c.toString());
    req.on('end', () => {
      try {
        const ev = JSON.parse(body || '{}');
        if (!ev.ts) ev.ts = Date.now();
        ev.__serverTs = Date.now();
        fs.appendFileSync(LOG_FILE, JSON.stringify(ev) + '\n');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, ts: ev.ts }));
      } catch (e) {
        res.writeHead(400); res.end('bad json');
      }
    });
    return;
  }
  res.writeHead(404); res.end('not found');
});

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`[DEBUG-SERVER] Listening on http://127.0.0.1:${PORT} | session=${SESSION_ID}\n`);
  process.stdout.write(`[DEBUG-SERVER] Log file: ${LOG_FILE}\n`);
});

let idleTimer = null;
const IDLE_MS = (parseInt(process.env.IDLE || '1200', 10)) * 1000;
function resetIdle() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { process.exit(0); }, IDLE_MS);
}
server.on('request', resetIdle);
resetIdle();
