import { test, expect } from '@playwright/test';

// The form posts to Web3Forms. Every test intercepts that request,
// so no real message is ever sent.
const FORM_API = 'https://api.web3forms.com/submit';

test('contact form sends a well-formed request and shows the thank-you page', async ({ page }) => {
  let sent: Record<string, unknown> | null = null;
  await page.route(FORM_API, async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });

  await page.goto('/contact/');
  await page.getByLabel('Name').fill('Test Person');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Phone').fill('509-555-0100');
  await page.getByRole('radio', { name: 'Builder' }).check();
  await page.getByLabel('Construction stage').selectOption('Pre-drywall');
  await page.getByLabel('Message').fill('Automated test message. Please ignore.');
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page).toHaveURL(/\/thank-you\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Thank you');

  expect(sent).not.toBeNull();
  const body = sent as unknown as Record<string, string>;
  expect(body.name).toBe('Test Person');
  expect(body.email).toBe('test@example.com');
  expect(body.phone).toBe('509-555-0100');
  expect(body.message).toContain('Automated test');
  expect(body['Customer type']).toBe('Builder');
  expect(body['Construction stage']).toBe('Pre-drywall');
  expect(body.access_key, 'FORM_ACCESS_KEY must be set at build time').toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  );
  expect(body.botcheck ?? '').toBe(''); // honeypot stays empty for real people
});

test('contact form shows clear errors and sends nothing when required fields are empty', async ({ page }) => {
  let calls = 0;
  await page.route(FORM_API, async (route) => {
    calls++;
    await route.abort();
  });

  await page.goto('/contact/');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  await expect(page.getByText('Please enter a message.')).toBeVisible();
  await expect(page).toHaveURL(/\/contact\/?$/);
  expect(calls).toBe(0);
});

test('a failed send shows an error and the phone fallback', async ({ page }) => {
  await page.route(FORM_API, (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false}' }),
  );
  await page.goto('/contact/');
  await page.getByLabel('Name').fill('Test Person');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Message').fill('Automated test message.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status')).toContainText('could not be sent');
  await expect(page.getByText('You can also reach us by phone at')).toBeVisible();
});

test('quote links on the Services page open the form with the stage already chosen', async ({ page }) => {
  await page.goto('/services/');
  await page.getByRole('link', { name: 'Request a quote for Post-Drywall Air Sealing' }).click();
  await expect(page).toHaveURL(/\/contact\/\?service=post-drywall$/);
  await expect(page.getByLabel('Construction stage')).toHaveValue('Post-drywall');
});
