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
});
