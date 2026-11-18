// Runs Lighthouse on every page, phone and desktop, and prints the four scores.
// Usage: node scripts/lighthouse.mjs [baseUrl]   (default http://localhost:4321)
// Exits with an error if any score is under 90.
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

const base = process.argv[2] || 'http://localhost:4321';
const pages = ['/', '/services/', '/about/', '/contact/', '/privacy/'];
const port = 9333;
// Cloudflare preview addresses (*.workers.dev) tell Google not to list them,
// which is correct for a preview. Skip that one SEO item there.
const skipAudits = base.includes('.workers.dev') ? ['is-crawlable'] : undefined;

const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
let failed = false;
const problems = new Map();
for (const path of pages) {
  for (const form of ['phone', 'desktop']) {
    const result = await lighthouse(
      base + path,
      { port, output: 'json', logLevel: 'error', skipAudits },
      form === 'desktop' ? desktopConfig : undefined,
    );
    const cats = result.lhr.categories;
    const scores = Object.values(cats).map((c) => [c.title, Math.round(c.score * 100)]);
    if (scores.some(([, s]) => s < 90)) failed = true;
    console.log(path.padEnd(12), form.padEnd(8), scores.map(([t, s]) => `${t}: ${s}`).join(' | '));
    for (const a of Object.values(result.lhr.audits)) {
      if (a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'manual') {
        problems.set(a.id, a.title);
      }
    }
  }
}
await browser.close();
if (problems.size) {
  console.log('\nItems flagged:');
  for (const [id, t] of problems) console.log(` - ${id}: ${t}`);
}
process.exit(failed ? 1 : 0);
