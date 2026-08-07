import { apiFetch } from './client';
import type { CreateTicketInput, Paginated, Ticket, TicketComment, TicketDetail } from '../types';

// GET /tickets ist laut Brief serverseitig bereits auf eigene Tickets gefiltert.
export function listTickets(): Promise<Paginated<Ticket>> {
  return apiFetch<Paginated<Ticket>>('/tickets');
}

export function getTicket(id: number): Promise<TicketDetail> {
  return apiFetch<TicketDetail>(`/tickets/${id}`);
}

export function createTicket(input: CreateTicketInput): Promise<Ticket> {
  return apiFetch<Ticket>('/tickets', { method: 'POST', body: input });
}

export function addComment(ticketId: number, body: string): Promise<TicketComment> {
  return apiFetch<TicketComment>(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: { body },
  });
}
