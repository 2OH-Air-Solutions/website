// Checks the built site (dist/) for broken links and missing files.
// Every link, image, script, and stylesheet that points inside the site must
// lead to a real file. Also checks that each page has a title, a description,
// and exactly one H1. Exits with an error if anything is wrong.
// Usage: node scripts/check-links.mjs
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = 'dist';
const site = 'https://2ohairsolutions.com';
const files = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
};
walk(root);

const resolves = (path) => {
  const clean = decodeURIComponent(path.split(/[?#]/)[0]);
  const target = join(root, clean);
  if (clean.endsWith('/')) return existsSync(join(target, 'index.html'));
  return existsSync(target) || existsSync(join(target, 'index.html')) || existsSync(target + '.html');
};

const problems = [];
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const page = '/' + relative(root, file).replace(/\\/g, '/').replace(/index\.html$/, '');
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  const srcsets = [...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) =>
    m[1].split(',').map((s) => s.trim().split(/\s+/)[0]),
  );
  for (let ref of [...refs, ...srcsets]) {
    if (ref.startsWith(site)) ref = ref.slice(site.length) || '/';
    if (!ref.startsWith('/') || ref.startsWith('//')) continue; // outside links, tel:, mailto:, #anchors
    if (!resolves(ref)) problems.push(`${page}: broken link to ${ref}`);
  }
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${page}: missing title`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) problems.push(`${page}: missing description`);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`${page}: has ${h1s} H1 headings (should be 1)`);
}

if (problems.length) {
  console.error(`Found ${problems.length} problem(s):`);
  for (const p of problems) console.error(' - ' + p);
  process.exit(1);
}
console.log(`Checked ${files.length} pages: all links work, and every page has a title, description, and one H1.`);
