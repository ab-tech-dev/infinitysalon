#!/usr/bin/env node
/* Injects data.json into the page so the built index.html is fully
   self-contained — it works opened straight from the filesystem as well as
   served over http. data.json stays the single source of truth: edit it,
   then re-run this. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(root, 'src', 'page.html'), 'utf8');
const raw = fs.readFileSync(path.join(root, 'data.json'), 'utf8');

const data = JSON.parse(raw);                       /* fail loudly on bad JSON */

/* Only the fields the page actually reads. Shipping the whole record would
   put the scrape metadata and unused asset paths into every page load. */
const slim = {
  business: data.business,
  contact: data.contact,
  pillars: data.pillars,
  pricing: data.pricing,
  /* img is needed by the shop grid — dropping it here is what silently
     rendered six <img src="undefined"> */
  products: data.products.map(p => ({ name: p.name, price: p.price, body: p.body, img: p.img })),
  policies: data.policies
};

const marker = '/*__DATA__*/null';
if (!tpl.includes(marker)) {
  console.error('build failed: data marker missing from src/page.html');
  process.exit(1);
}

/* hero3d.js (the Three.js built-world hero) is no longer wired into the page
   — the hero is a plain video now. The file stays in src/ as a reference for
   the earlier approach; nothing here reads it any more. */

const out = tpl.replace(marker, JSON.stringify(slim));
fs.writeFileSync(path.join(root, 'index.html'), out, 'utf8');

const items = slim.pricing.categories.reduce((s, c) => s + c.items.length, 0);
console.log(
  'built index.html — ' + (Buffer.byteLength(out) / 1024).toFixed(1) + ' KB' +
  '  (' + slim.pricing.categories.length + ' categories, ' + items + ' services, ' +
  slim.products.length + ' products)'
);
