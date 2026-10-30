import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';
import { renderApp } from './test/renderApp';
import { article, asset, server, ticket } from './test/server';

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
    expect(screen.getByText('Offen')).toBeInTheDocument();
    expect(screen.getByText('Priorität Mittel')).toBeInTheDocument();
    expect(screen.getByText('1 Ticket')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument();
    expect(screen.getByText('ISD Portal')).toBeInTheDocument();
    expect(sessionStorage.getItem('isd_portal_token')).toBe('test-token');
    expect(localStorage.getItem('isd_portal_token')).toBeNull();
  });

  test('restores a session, creates a ticket and logs out', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('isd_portal_token', 'existing-token');
    renderApp(['/tickets/new']);

    await user.type(await screen.findByLabelText('Betreff'), 'VPN funktioniert nicht');
    await user.type(screen.getByLabelText('Beschreibung'), 'Der Verbindungsaufbau schlägt fehl.');
    await user.click(screen.getByRole('button', { name: 'Ticket erstellen' }));

    expect(await screen.findByRole('heading', { name: 'VPN funktioniert nicht' })).toBeInTheDocument();
    expect(screen.getByText('Dein Ticket wurde erfolgreich erstellt.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abmelden' }));
    expect(await screen.findByRole('button', { name: 'Anmelden' })).toBeInTheDocument();
    expect(sessionStorage.getItem('isd_portal_token')).toBeNull();
  });

  test('validates ticket fields before creating a request', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('isd_portal_token', 'existing-token');
    let createRequests = 0;

    server.use(
      http.post(`${api}/tickets`, () => {
        createRequests += 1;
        return HttpResponse.json({ message: 'Unexpected request.' }, { status: 500 });
      }),
    );

    renderApp(['/tickets/new']);

    const titleInput = await screen.findByLabelText('Betreff');
    expect(titleInput).toHaveAttribute('maxlength', '255');
    expect(screen.getByLabelText('Priorität')).toHaveValue('medium');

    await user.type(titleInput, '   ');
    await user.type(screen.getByLabelText('Beschreibung'), '   ');
    await user.click(screen.getByRole('button', { name: 'Ticket erstellen' }));

    expect(await screen.findByText('Bitte gib einen aussagekräftigen Betreff ein.')).toBeInTheDocument();
    expect(screen.getByText('Bitte beschreibe dein Anliegen.')).toBeInTheDocument();
    expect(createRequests).toBe(0);
  });

  test('shows backend validation errors at the affected ticket field', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('isd_portal_token', 'existing-token');

    server.use(
      http.post(`${api}/tickets`, () =>
        HttpResponse.json(
          {
            message: 'The given data was invalid.',
            errors: { title: ['Dieser Betreff kann nicht verwendet werden.'] },
          },
          { status: 422 },
        ),
      ),
    );

    renderApp(['/tickets/new']);

    await user.type(await screen.findByLabelText('Betreff'), 'VPN-Problem');
    await user.type(screen.getByLabelText('Beschreibung'), 'Die Verbindung schlägt fehl.');
    await user.selectOptions(screen.getByLabelText('Priorität'), 'high');
    await user.click(screen.getByRole('button', { name: 'Ticket erstellen' }));

    expect(await screen.findByText('Dieser Betreff kann nicht verwendet werden.')).toBeInTheDocument();
    expect(screen.getByLabelText('Betreff')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('The given data was invalid.')).not.toBeInTheDocument();
  });

  test('confirms a saved ticket comment and clears the input', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('isd_portal_token', 'existing-token');

    renderApp(['/tickets/42']);

    expect(await screen.findByRole('heading', { name: 'VPN funktioniert nicht' })).toBeInTheDocument();
    const commentInput = screen.getByLabelText('Kommentar hinzufügen');
    await user.type(commentInput, 'Weitere Informationen zum Fehler.');
    await user.click(screen.getByRole('button', { name: 'Kommentar senden' }));

    expect(await screen.findByText('Dein Kommentar wurde gespeichert.')).toBeInTheDocument();
    expect(commentInput).toHaveValue('');
  });

  test('retries a temporarily failed ticket request', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('isd_portal_token', 'existing-token');
    let requests = 0;

    server.use(
      http.get(`${api}/tickets`, () => {
        requests += 1;

        if (requests === 1) {
          return HttpResponse.json({ message: 'Dienst vorübergehend nicht verfügbar.' }, { status: 503 });
        }

        return HttpResponse.json({
          data: [{
            id: 42,
            title: 'VPN funktioniert nicht',
            description: 'Der Verbindungsaufbau schlägt fehl.',
            status: { value: 'open', label: 'Offen', color: 'blue' },
            priority: { value: 'medium', label: 'Mittel', color: 'blue' },
            requester: { id: 3, name: 'Ada Lovelace', email: 'ada@example.test' },
            assignee: null,
            category: null,
            asset: null,
            due_at: null,
            resolved_at: null,
            closed_at: null,
            created_at: '2026-08-30T10:00:00Z',
            updated_at: '2026-08-30T10:00:00Z',
          }],
          links: { first: null, last: null, prev: null, next: null },
          meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
        });
      }),
    );

    renderApp(['/tickets']);

    expect(await screen.findByText('Das hat nicht geklappt')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Erneut versuchen' }));

    expect(await screen.findByText('VPN funktioniert nicht')).toBeInTheDocument();
    expect(requests).toBe(2);
  });

  test('loads the requested ticket page through the shared pagination controls', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('isd_portal_token', 'existing-token');
    const requestedPages: number[] = [];

    server.use(
      http.get(`${api}/tickets`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page') ?? '1');
        requestedPages.push(page);

        return HttpResponse.json({
          data: [{
            ...ticket,
            id: page === 2 ? 43 : ticket.id,
            title: page === 2 ? 'Drucker im Büro nicht erreichbar' : ticket.title,
          }],
          links: { first: null, last: null, prev: page === 2 ? 'previous' : null, next: page === 1 ? 'next' : null },
          meta: { current_page: page, last_page: 2, per_page: 15, total: 16 },
        });
      }),
    );

    renderApp(['/tickets']);

    expect(await screen.findByText('VPN funktioniert nicht')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Seitennavigation' })).toHaveTextContent('Seite 1 von 2');
    await user.click(screen.getByRole('button', { name: 'Weiter →' }));

    expect(await screen.findByText('Drucker im Büro nicht erreichbar')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Seitennavigation' })).toHaveTextContent('Seite 2 von 2');
    expect(requestedPages).toEqual([1, 2]);
  });

  test('clears an expired session when a protected API request returns 401', async () => {
    sessionStorage.setItem('isd_portal_token', 'expired-token');
    server.use(
      http.get(`${api}/tickets`, () =>
        HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 }),
      ),
    );

    renderApp(['/tickets']);

    expect(await screen.findByRole('button', { name: 'Anmelden' })).toBeInTheDocument();
    expect(sessionStorage.getItem('isd_portal_token')).toBeNull();
  });

  test('does not expose backend details for an inaccessible resource', async () => {
    sessionStorage.setItem('isd_portal_token', 'existing-token');
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
    sessionStorage.setItem('isd_portal_token', 'existing-token');
    let requestedSearch: string | null = null;
    let requestedPage: string | null = null;

    server.use(
      http.get(`${api}/assets`, ({ request }) => {
        const url = new URL(request.url);
        requestedSearch = url.searchParams.get('search');
        requestedPage = url.searchParams.get('page');
        const page = Number(requestedPage ?? '1');

        return HttpResponse.json({
          data: requestedSearch ? [] : [{
            ...asset,
            id: page === 2 ? 9 : asset.id,
            asset_tag: page === 2 ? 'DOCK-009' : asset.asset_tag,
            name: page === 2 ? 'USB-C Dockingstation' : asset.name,
          }],
          links: { first: null, last: null, prev: page === 2 ? 'previous' : null, next: page === 1 ? 'next' : null },
          meta: {
            current_page: page,
            last_page: requestedSearch ? 1 : 2,
            per_page: 15,
            total: requestedSearch ? 0 : 16,
          },
        });
      }),
    );

    renderApp(['/assets']);

    expect(await screen.findByText('ThinkPad X1 Carbon')).toBeInTheDocument();
    expect(screen.getByText('NB-008')).toBeInTheDocument();
    expect(screen.getByText('Notebooks')).toBeInTheDocument();
    expect(screen.getAllByText('Ada Lovelace')).toHaveLength(2);
    expect(screen.getByText('seit 01.08.2026')).toBeInTheDocument();
    expect(screen.getByText('10.02.2028')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Weiter →' }));
    expect(await screen.findByText('USB-C Dockingstation')).toBeInTheDocument();
    expect(requestedPage).toBe('2');

    await user.type(screen.getByLabelText('Assets durchsuchen'), '  docking station  ');
    await user.click(screen.getByRole('button', { name: 'Suchen' }));

    expect(await screen.findByText('Keine passenden Assets gefunden')).toBeInTheDocument();
    expect(requestedSearch).toBe('docking station');
    expect(requestedPage).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Alle Assets anzeigen' }));
    expect(await screen.findByText('ThinkPad X1 Carbon')).toBeInTheDocument();
    expect(requestedSearch).toBeNull();
  });

  test('searches the knowledge base and exposes complete article content', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('isd_portal_token', 'existing-token');
    let requestedSearch: string | null = null;
    let requestedPage: string | null = null;

    server.use(
      http.get(`${api}/kb/articles`, ({ request }) => {
        const url = new URL(request.url);
        requestedSearch = url.searchParams.get('search');
        requestedPage = url.searchParams.get('page');
        const page = Number(requestedPage ?? '1');

        return HttpResponse.json({
          data: requestedSearch ? [] : [{
            ...article,
            id: page === 2 ? 6 : article.id,
            title: page === 2 ? 'Drucker neu verbinden' : article.title,
            slug: page === 2 ? 'drucker-neu-verbinden' : article.slug,
          }],
          links: { first: null, last: null, prev: page === 2 ? 'previous' : null, next: page === 1 ? 'next' : null },
          meta: {
            current_page: page,
            last_page: requestedSearch ? 1 : 2,
            per_page: 15,
            total: requestedSearch ? 0 : 16,
          },
        });
      }),
    );

    renderApp(['/kb']);

    expect(await screen.findByText('VPN-Verbindung einrichten')).toBeInTheDocument();
    expect(screen.getByText('Netzwerk')).toBeInTheDocument();
    expect(screen.getByText('VPN')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Weiter →' }));
    expect(await screen.findByText('Drucker neu verbinden')).toBeInTheDocument();
    expect(requestedPage).toBe('2');

    await user.type(screen.getByLabelText('Artikel durchsuchen'), '  drucker  ');
    await user.click(screen.getByRole('button', { name: 'Suchen' }));

    expect(await screen.findByText('Keine passenden Artikel gefunden')).toBeInTheDocument();
    expect(requestedSearch).toBe('drucker');
    expect(requestedPage).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Alle Artikel anzeigen' }));
    expect(await screen.findByText('VPN-Verbindung einrichten')).toBeInTheDocument();
    expect(requestedSearch).toBeNull();
  });
});
