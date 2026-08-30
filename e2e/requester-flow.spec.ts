import { expect, test } from '@playwright/test';

const api = '**/api/v1';
const user = { id: 3, name: 'Ada Lovelace', email: 'ada@example.test' };
const ticket = {
  id: 42,
  title: 'VPN funktioniert nicht',
  description: 'Der Verbindungsaufbau schlägt fehl.',
  status: { value: 'open', label: 'Offen', color: 'blue' },
  priority: { value: 'medium', label: 'Mittel', color: 'blue' },
  requester: user,
  assignee: null,
  category: null,
  asset: null,
  due_at: null,
  resolved_at: null,
  closed_at: null,
  created_at: '2026-08-30T10:00:00Z',
  updated_at: '2026-08-30T10:00:00Z',
};

test('requester can log in, create a ticket and log out', async ({ page }) => {
  await page.route(`${api}/auth/login`, (route) => route.fulfill({ json: { token: 'e2e-token', user } }));
  await page.route(`${api}/auth/logout`, (route) => route.fulfill({ json: { message: 'Erfolgreich abgemeldet.' } }));
  await page.route(`${api}/tickets`, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 201, json: { data: ticket } });
      return;
    }
    await route.fulfill({ json: { data: [ticket], links: {}, meta: {} } });
  });
  await page.route(`${api}/tickets/42`, (route) =>
    route.fulfill({ json: { data: { ...ticket, comments: [], attachments: [], history: [] } } }),
  );

  await page.goto('/login');
  await page.getByLabel('E-Mail').fill('ada@example.test');
  await page.getByLabel('Passwort').fill('secret');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page.getByRole('heading', { name: 'Meine Tickets' })).toBeVisible();

  await page.getByRole('link', { name: 'Neues Ticket' }).first().click();
  await page.getByLabel('Betreff').fill(ticket.title);
  await page.getByLabel('Beschreibung').fill(ticket.description);
  await page.getByRole('button', { name: 'Ticket erstellen' }).click();
  await expect(page.getByRole('heading', { name: ticket.title })).toBeVisible();

  await page.getByRole('button', { name: 'Abmelden' }).click();
  await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible();
});
