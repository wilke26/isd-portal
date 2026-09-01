import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const api = 'https://isd.local/api/v1';
const user = { id: 3, name: 'Ada Lovelace', email: 'ada@example.test' };

export const ticket = {
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

const paginatedTickets = {
  data: [ticket],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
};

export const asset = {
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
  current_assignment: { user, assigned_at: '2026-08-01T10:00:00Z' },
  created_at: '2025-02-10T10:00:00Z',
  updated_at: '2026-08-01T10:00:00Z',
};

const paginatedAssets = {
  data: [asset],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
};

export const handlers = [
  http.post(`${api}/auth/login`, () => HttpResponse.json({ token: 'test-token', user })),
  http.get(`${api}/auth/me`, () => HttpResponse.json(user)),
  http.post(`${api}/auth/logout`, () => HttpResponse.json({ message: 'Erfolgreich abgemeldet.' })),
  http.get(`${api}/tickets`, () => HttpResponse.json(paginatedTickets)),
  http.get(`${api}/assets`, () => HttpResponse.json(paginatedAssets)),
  http.post(`${api}/tickets`, () => HttpResponse.json({ data: ticket }, { status: 201 })),
  http.get(`${api}/tickets/:id`, () =>
    HttpResponse.json({ data: { ...ticket, comments: [], attachments: [], history: [] } }),
  ),
];

export const server = setupServer(...handlers);
