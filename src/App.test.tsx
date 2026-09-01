import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';
import { renderApp } from './test/renderApp';
import { server } from './test/server';

const api = 'https://isd.local/api/v1';

describe('requester portal flow', () => {
  test('redirects unauthenticated users and completes login', async () => {
    const user = userEvent.setup();
    renderApp(['/tickets']);

    await user.type(await screen.findByLabelText('E-Mail'), 'ada@example.test');
    await user.type(screen.getByLabelText('Passwort'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Anmelden' }));

    expect(await screen.findByRole('heading', { name: 'Meine Tickets' })).toBeInTheDocument();
    expect(await screen.findByText('VPN funktioniert nicht')).toBeInTheDocument();
    expect(localStorage.getItem('isd_portal_token')).toBe('test-token');
  });

  test('restores a session, creates a ticket and logs out', async () => {
    const user = userEvent.setup();
    localStorage.setItem('isd_portal_token', 'existing-token');
    renderApp(['/tickets/new']);

    await user.type(await screen.findByLabelText('Betreff'), 'VPN funktioniert nicht');
    await user.type(screen.getByLabelText('Beschreibung'), 'Der Verbindungsaufbau schlägt fehl.');
    await user.click(screen.getByRole('button', { name: 'Ticket erstellen' }));

    expect(await screen.findByRole('heading', { name: 'VPN funktioniert nicht' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abmelden' }));
    expect(await screen.findByRole('button', { name: 'Anmelden' })).toBeInTheDocument();
    expect(localStorage.getItem('isd_portal_token')).toBeNull();
  });

  test('clears an expired session when a protected API request returns 401', async () => {
    localStorage.setItem('isd_portal_token', 'expired-token');
    server.use(
      http.get(`${api}/tickets`, () =>
        HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 }),
      ),
    );

    renderApp(['/tickets']);

    expect(await screen.findByRole('button', { name: 'Anmelden' })).toBeInTheDocument();
    expect(localStorage.getItem('isd_portal_token')).toBeNull();
  });

  test('does not expose backend details for an inaccessible resource', async () => {
    localStorage.setItem('isd_portal_token', 'existing-token');
    server.use(
      http.get(`${api}/tickets/999`, () =>
        HttpResponse.json(
          { message: 'No query results for model [App\\Models\\Ticket] 999' },
          { status: 404 },
        ),
      ),
    );

    renderApp(['/tickets/999']);

    expect(await screen.findByText('Die angeforderte Ressource wurde nicht gefunden.')).toBeInTheDocument();
    expect(screen.queryByText(/App\\Models\\Ticket/)).not.toBeInTheDocument();
  });

  test('shows the requester assets and sends the search filter to the API', async () => {
    const user = userEvent.setup();
    localStorage.setItem('isd_portal_token', 'existing-token');
    let requestedSearch: string | null = null;

    server.use(
      http.get(`${api}/assets`, ({ request }) => {
        requestedSearch = new URL(request.url).searchParams.get('search');

        return HttpResponse.json({
          data: requestedSearch ? [] : [{
            id: 8,
            asset_tag: 'NB-008',
            name: 'ThinkPad X1 Carbon',
            serial_number: 'PF-12345',
            manufacturer: 'Lenovo',
            model: 'X1 Carbon',
            purchased_at: '2025-02-10',
            warranty_until: '2028-02-10',
            notes: null,
            category: { id: 4, name: 'Notebooks' },
            status: { id: 2, name: 'Ausgegeben', color: '#2563eb' },
            current_assignment: null,
            created_at: '2025-02-10T10:00:00Z',
            updated_at: '2026-08-01T10:00:00Z',
          }],
          links: { first: null, last: null, prev: null, next: null },
          meta: { current_page: 1, last_page: 1, per_page: 15, total: requestedSearch ? 0 : 1 },
        });
      }),
    );

    renderApp(['/assets']);

    expect(await screen.findByText('ThinkPad X1 Carbon')).toBeInTheDocument();
    expect(screen.getByText('NB-008')).toBeInTheDocument();
    expect(screen.getByText('Notebooks')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Assets durchsuchen'), '  docking station  ');
    await user.click(screen.getByRole('button', { name: 'Suchen' }));

    expect(await screen.findByText('Keine passenden Assets gefunden.')).toBeInTheDocument();
    expect(requestedSearch).toBe('docking station');
  });
});
