import { test, expect } from '@playwright/test';

const pages = ['/', '/services/', '/about/', '/contact/', '/privacy/'];

for (const path of pages) {
  test(`${path} has one H1, a title, a description, a canonical URL, and the phone number`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThanOrEqual(60);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc?.length ?? 0).toBeGreaterThan(0);
    expect(desc!.length).toBeLessThanOrEqual(155);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/2ohairsolutions\.com\//);
    await expect(page.locator('a[href="tel:+15099038595"]').first()).toBeVisible();
  });
}
