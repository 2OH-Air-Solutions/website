// Screenshots every page at phone (375px) and desktop (1280px) widths and
// reports basic problems: horizontal scroll, broken images, small tap targets.
// Usage: node scripts/screenshots.mjs [baseUrl] [outDir]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:4321';
const out = process.argv[3] || 'screenshots';
fs.mkdirSync(out, { recursive: true });
const pages = ['/', '/services/', '/about/', '/contact/', '/privacy/', '/thank-you/', '/404/'];
const browser = await chromium.launch();
let problems = 0;
for (const [label, width] of [['phone', 375], ['desktop', 1280]]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    const name = (p === '/' ? 'home' : p.replace(/\//g, '')) + '-' + label;
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    const r = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
      const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src);
      const small = [...document.querySelectorAll('a, button, input, textarea')]
        .filter((el) => { const b = el.getBoundingClientRect(); const s = getComputedStyle(el);
          return b.width > 0 && s.visibility !== 'hidden' && el.className !== 'hp' && el.className !== 'skip' && b.height < 24 && !el.closest('p, li'); })
        .map((el) => (el.textContent || el.getAttribute('name') || '').trim().slice(0, 30));
      const h1 = document.querySelectorAll('h1').length;
      return { overflow, broken, small, h1, title: document.title.length, desc: (document.querySelector('meta[name=description]')?.getAttribute('content') || '').length };
    });
    const issues = [];
    if (r.overflow) issues.push('horizontal scroll');
    if (r.broken.length) issues.push('broken images: ' + r.broken.join(', '));
    if (r.small.length) issues.push('small tap targets: ' + r.small.join(' | '));
    if (r.h1 !== 1) issues.push(`${r.h1} H1s`);
    if (r.title > 60) issues.push(`title ${r.title} chars`);
    if (r.desc > 155 || r.desc === 0) issues.push(`description ${r.desc} chars`);
    problems += issues.length;
    console.log(`${label.padEnd(7)} ${p.padEnd(12)} ${issues.length ? 'ISSUES: ' + issues.join('; ') : 'ok'}`);
  }
  await ctx.close();
}
await browser.close();
process.exit(problems ? 1 : 0);
