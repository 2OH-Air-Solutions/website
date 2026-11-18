// Renders src/assets/logo.svg to public/logo.png (white background, padded) for Google.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const root = process.argv[2];
const svg = readFileSync(`${root}/src/assets/logo.svg`, 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 200 } });
await page.setContent(
  `<html><body style="margin:0;background:#fff;display:grid;place-items:center;width:800px;height:200px">
   <div style="width:700px">${svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ')}</div></body></html>`,
);
await page.waitForTimeout(300);
await page.screenshot({ path: `${root}/public/logo.png` });
await browser.close();
console.log('ok');
