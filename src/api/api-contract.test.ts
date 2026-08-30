import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'vitest';
import { logout, me } from './auth.ts';
import { listArticles } from './kb.ts';
import { addComment, createTicket, getTicket } from './tickets.ts';

let requests: Array<{ url: string; init?: RequestInit }> = [];
let responseBody: unknown;

beforeEach(() => {
  requests = [];
  responseBody = {};
  localStorage.clear();

  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), init });
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
});

afterEach(() => {
  localStorage.clear();
});

test('ticket detail unwraps the Laravel resource envelope', async () => {
  responseBody = { data: { id: 42, title: 'VPN defekt', comments: [] } };

  const ticket = await getTicket(42);

  assert.equal(ticket.id, 42);
  assert.equal(ticket.title, 'VPN defekt');
  assert.equal(requests[0]?.url, 'https://isd.local/api/v1/tickets/42');
});

test('ticket creation sends the backend title field', async () => {
  responseBody = { data: { id: 7, title: 'Laptop startet nicht' } };

  const ticket = await createTicket({ title: 'Laptop startet nicht', description: 'Seit heute.' });

  assert.equal(ticket.id, 7);
  assert.equal(requests[0]?.init?.method, 'POST');
  assert.deepEqual(JSON.parse(String(requests[0]?.init?.body)), {
    title: 'Laptop startet nicht',
    description: 'Seit heute.',
  });
});

test('comment endpoint accepts the backend message response', async () => {
  responseBody = { message: 'Kommentar hinzugefügt.' };

  const result = await addComment(7, 'Bitte neu starten.');

  assert.equal(result.message, 'Kommentar hinzugefügt.');
  assert.equal(requests[0]?.url, 'https://isd.local/api/v1/tickets/7/comments');
});

test('knowledge-base search uses the backend search parameter', async () => {
  responseBody = { data: [], meta: {}, links: {} };

  await listArticles('VPN & WLAN');

  assert.equal(
    requests[0]?.url,
    'https://isd.local/api/v1/kb/articles?search=VPN+%26+WLAN',
  );
});

test('session restore and logout authenticate against the backend', async () => {
  localStorage.setItem('isd_portal_token', 'secret-token');
  responseBody = { id: 3, name: 'Ada', email: 'ada@example.test' };

  const user = await me();
  assert.equal(user.name, 'Ada');

  responseBody = { message: 'Erfolgreich abgemeldet.' };
  await logout();

  const restoreHeaders = requests[0]?.init?.headers;
  const logoutHeaders = requests[1]?.init?.headers;
  assert.ok(restoreHeaders);
  assert.ok(logoutHeaders);
  assert.equal(restoreHeaders instanceof Headers, false);
  assert.equal((restoreHeaders as Record<string, string>).Authorization, 'Bearer secret-token');
  assert.equal(requests[1]?.url, 'https://isd.local/api/v1/auth/logout');
  assert.equal((logoutHeaders as Record<string, string>).Authorization, 'Bearer secret-token');
});
