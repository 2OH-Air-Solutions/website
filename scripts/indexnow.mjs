// Tells search engines (Bing, Yandex, and others that use IndexNow) that the
// site's pages have changed. Run after a deploy to the real domain:
//   node scripts/indexnow.mjs
// The key file lives in public/<key>.txt. The key is public by design; it is not a secret.
import { readdirSync, readFileSync } from 'node:fs';

const host = '2ohairsolutions.com';
const keyFile = readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('No IndexNow key file found in public/');
const key = keyFile.replace('.txt', '');

// Use the page list from the built sitemap, so new pages are included automatically.
const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${keyFile}`, urlList }),
});
console.log(`IndexNow: ${res.status} for ${urlList.length} pages`);
if (res.status >= 400) process.exit(1);
