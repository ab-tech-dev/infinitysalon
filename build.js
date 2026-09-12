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

/* The FAQ answers carry {tokens} rather than repeating the address, hours,
   number and email, so those four facts still have exactly one home. */
const tokens = {
  '{address}': data.business.address.line,
  '{hours}': data.business.hours.line,
  '{whatsapp}': data.contact.whatsapp.display,
  '{email}': data.contact.email
};
const expand = s => Object.keys(tokens).reduce((t, k) => t.split(k).join(tokens[k]), s);
const faqs = (data.faqs || []).map(f => ({ q: f.q, a: expand(f.a) }));

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
  latestStyles: data.latestStyles || [],
  tiktoks: data.tiktoks || [],
  policies: data.policies,
  serviceIndex: data.serviceIndex || [],
  faqs
};

/* ------------------------------------------------------- structured data
   A salon that sells nine different things is invisible to search if the
   page only says so in prose. This emits the machine-readable version of
   the same record: one HairSalon with its address, hours and contact
   points, an offer catalogue holding every priced service, and the FAQ.
   All of it is generated from data.json, so a price edited there is a price
   corrected in the markup, in the price list and in the search results alike. */
const site = (data.site && data.site.url ? data.site.url : '').replace(/\/+$/, '');
const abs = p => site ? site + '/' + String(p).replace(/^\/+/, '') : String(p);

/* "£100" is a fixed price, "£30 – £40" a range, and "+£30" a supplement to
   another line — that last one gets no price rather than a misleading one. */
function offerPrice(price) {
  const one = /^£\s*(\d+(?:\.\d+)?)$/.exec(price);
  if (one) return { price: one[1], priceCurrency: 'GBP' };
  const range = /^£\s*(\d+(?:\.\d+)?)\s*[–—-]\s*£?\s*(\d+(?:\.\d+)?)$/.exec(price);
  if (range) {
    return {
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: range[1], maxPrice: range[2], priceCurrency: 'GBP'
      }
    };
  }
  return null;
}

const pricedCatalog = data.pricing.categories.map(c => ({
  '@type': 'OfferCatalog',
  name: c.label,
  itemListElement: c.items.map(it => Object.assign({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: it.name, serviceType: c.label },
    availability: 'https://schema.org/InStock'
  }, offerPrice(it.price)))
}));

/* The lines that are quoted on enquiry still belong in the catalogue — a
   service with no published number is not a service the salon does not do. */
const quoted = (data.serviceIndex || []).filter(s => /enquiry/i.test(s.tag));
const quotedCatalog = quoted.length ? [{
  '@type': 'OfferCatalog',
  name: 'Quoted on enquiry',
  itemListElement: quoted.map(s => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: s.name, description: s.body },
    availability: 'https://schema.org/InStock'
  }))
}] : [];

const business = {
  '@context': 'https://schema.org',
  '@type': ['HairSalon', 'BeautySalon'],
  '@id': site ? site + '/#salon' : undefined,
  name: data.business.name,
  alternateName: data.business.shortName,
  slogan: data.business.tagline,
  description: data.business.description,
  url: site || undefined,
  image: abs('assets/img/og-image.jpg'),
  logo: abs('assets/img/logo-mark.png'),
  telephone: '+' + data.contact.whatsapp.e164,
  email: data.contact.email,
  priceRange: '££',
  currenciesAccepted: 'GBP',
  address: {
    '@type': 'PostalAddress',
    streetAddress: data.business.address.street,
    addressLocality: data.business.address.area,
    addressRegion: data.business.address.city,
    postalCode: data.business.address.postcode,
    addressCountry: 'GB'
  },
  areaServed: [
    { '@type': 'Place', name: 'Woolwich' },
    { '@type': 'Place', name: 'London' }
  ],
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '09:00', closes: '21:00'
  }],
  sameAs: [data.contact.tiktok.url],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: data.business.name + ' — services',
    itemListElement: pricedCatalog.concat(quotedCatalog)
  }
};

const graph = [business];
if (faqs.length) {
  graph.push({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  });
}

/* A "</script>" inside a script block would end it early; the schema is data,
   not markup, so it is escaped rather than trusted. */
const jsonld = graph.map(g =>
  '<script type="application/ld+json">' +
  JSON.stringify(g).replace(/</g, '\\u003c') +
  '</script>'
).join('\n');

const marker = '/*__DATA__*/null';
if (!tpl.includes(marker)) {
  console.error('build failed: data marker missing from src/page.html');
  process.exit(1);
}
const ldMarker = '<!--__JSONLD__-->';
if (!tpl.includes(ldMarker)) {
  console.error('build failed: structured-data marker missing from src/page.html');
  process.exit(1);
}

/* hero3d.js (the Three.js built-world hero) is no longer wired into the page
   — the hero is a plain video now. The file stays in src/ as a reference for
   the earlier approach; nothing here reads it any more. */

const canonical = site
  ? '<link rel="canonical" href="' + site + '/">\n' +
    '<meta property="og:url" content="' + site + '/">\n' +
    '<meta property="og:image" content="' + abs('og-image.jpg') + '">\n' +
    '<meta property="og:image:secure_url" content="' + abs('og-image.jpg') + '">\n' +
    '<meta property="og:image:type" content="image/jpeg">\n' +
    '<meta property="og:image:width" content="1200">\n' +
    '<meta property="og:image:height" content="630">\n' +
    '<meta property="og:image:alt" content="Infinity Hair and Beauty Salon — Your beauty, infinite possibilities">\n' +
    '<meta name="twitter:image" content="' + abs('og-image.jpg') + '">\n' +
    '<meta name="twitter:image:alt" content="Infinity Hair and Beauty Salon — Your beauty, infinite possibilities">\n' +
    '<link rel="image_src" href="' + abs('og-image.jpg') + '">'
  : '';

const out = tpl
  .replace(marker, JSON.stringify(slim).replace(/</g, '\\u003c'))
  .replace(ldMarker, jsonld)
  .replace('<!--__CANONICAL__-->', canonical);

fs.writeFileSync(path.join(root, 'index.html'), out, 'utf8');

/* robots.txt and a one-URL sitemap: cheap, and without them a crawler is
   left to guess. Skipped when no site URL is configured in data.json. */
if (site) {
  const pub = path.join(root, 'public');
  fs.mkdirSync(pub, { recursive: true });
  fs.writeFileSync(path.join(pub, 'robots.txt'),
    'User-agent: *\nAllow: /\n\nSitemap: ' + site + '/sitemap.xml\n');
  fs.writeFileSync(path.join(pub, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    '  <url><loc>' + site + '/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>\n' +
    '</urlset>\n');
}

const items = slim.pricing.categories.reduce((s, c) => s + c.items.length, 0);
console.log(
  'built index.html — ' + (Buffer.byteLength(out) / 1024).toFixed(1) + ' KB' +
  '  (' + slim.pricing.categories.length + ' categories, ' + items + ' services, ' +
  slim.products.length + ' products, ' + slim.serviceIndex.length + ' service lines, ' +
  faqs.length + ' FAQs)'
);
