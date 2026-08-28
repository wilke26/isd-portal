import { apiFetch } from './client.ts';
import type { ApiMessage, ApiResource, CreateTicketInput, Paginated, Ticket, TicketDetail } from '../types/index.ts';

// GET /tickets ist laut Brief serverseitig bereits auf eigene Tickets gefiltert.
export function listTickets(): Promise<Paginated<Ticket>> {
  return apiFetch<Paginated<Ticket>>('/tickets');
}

export async function getTicket(id: number): Promise<TicketDetail> {
  const response = await apiFetch<ApiResource<TicketDetail>>(`/tickets/${id}`);
  return response.data;
}

export function createTicket(input: CreateTicketInput): Promise<Ticket> {
  return apiFetch<Ticket>('/tickets', { method: 'POST', body: input });
}

export function addComment(ticketId: number, body: string): Promise<ApiMessage> {
  return apiFetch<ApiMessage>(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: { body },
  });
}
