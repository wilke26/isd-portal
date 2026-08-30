import { expect, test } from '@playwright/test';

test('@full-stack requester uses the portal against the real backend', async ({ page }) => {
  const ticketTitle = `Full-Stack-Test ${Date.now()}`;
  const description = 'Dieses Ticket wurde automatisiert über Portal, Laravel und MySQL angelegt.';

  await page.goto('/login');
  await page.getByLabel('E-Mail').fill('c.weber@isd.local');
  await page.getByLabel('Passwort').fill('password');
  await page.getByRole('button', { name: 'Anmelden' }).click();

  await expect(page.getByRole('heading', { name: 'Meine Tickets' })).toBeVisible();
  await page.getByRole('link', { name: 'Neues Ticket' }).first().click();
  await page.getByLabel('Betreff').fill(ticketTitle);
  await page.getByLabel('Beschreibung').fill(description);
  await page.getByRole('button', { name: 'Ticket erstellen' }).click();

  await expect(page.getByRole('heading', { name: ticketTitle })).toBeVisible();
  await expect(page.getByText(description)).toBeVisible();

  // A reload exercises token restoration through the real /auth/me endpoint
  // and proves that the newly created database record can be read back.
  await page.reload();
  await expect(page.getByRole('heading', { name: ticketTitle })).toBeVisible();

  await page.getByRole('button', { name: 'Abmelden' }).click();
  await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible();
});
