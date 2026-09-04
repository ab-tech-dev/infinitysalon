#!/usr/bin/env node
/* Static file server for the build, plus one extra route.
 *
 * POST /_shot/<name>  with a data: URL as the body writes shots/<name>.jpg.
 *
 * This exists because the automated screenshot path cannot capture a WebGL
 * canvas while the preview pane is hidden — requestAnimationFrame is
 * throttled to nothing and the drawing buffer is empty by the time the
 * capture lands. Letting the page hand the encoded frame back to disk gives
 * an honest picture of what the renderer actually produced.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(ROOT, 'shots');
const PORT = 4180;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon'
};

fs.mkdirSync(SHOTS, { recursive: true });

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);

  if (req.method === 'POST' && url.startsWith('/_shot/')) {
    const name = path.basename(url.slice(7)).replace(/[^a-z0-9._-]/gi, '') || 'shot';
    let body = '';
    req.setEncoding('utf8');
    req.on('data', d => { body += d; });
    req.on('end', () => {
      const comma = body.indexOf(',');
      const b64 = comma >= 0 ? body.slice(comma + 1) : body;
      const ext = /image\/png/.test(body.slice(0, 40)) ? '.png' : '.jpg';
      const file = path.join(SHOTS, name + ext);
      try {
        fs.writeFileSync(file, Buffer.from(b64, 'base64'));
        console.log('shot ->', path.relative(ROOT, file), (b64.length / 1365 | 0) + 'KB');
        res.writeHead(200, { 'content-type': 'text/plain' }); res.end('ok ' + file);
      } catch (e) {
        console.error('shot failed', e.message);
        res.writeHead(500); res.end(e.message);
      }
    });
    return;
  }

  let p = path.join(ROOT, url === '/' ? 'index.html' : url);
  if (!p.startsWith(ROOT)) { res.writeHead(403); res.end('no'); return; }
  fs.readFile(p, (err, buf) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, {
      'content-type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store'          /* always serve the current build */
    });
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1', () => console.log('serving ' + ROOT + ' on http://127.0.0.1:' + PORT));
