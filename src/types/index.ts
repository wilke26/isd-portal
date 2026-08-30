import type { components } from './generated/portal-v1.ts';

// The backend-owned OpenAPI document is the source of truth for all models
// crossing the isd/isd-portal boundary. UI-only helper types remain local.
export type User = components['schemas']['User'];
export type LoginResponse = components['schemas']['LoginResponse'];
export type ApiMessage = components['schemas']['Message'];

export interface ApiResource<T> {
  data: T;
}

export type TicketStatusValue = components['schemas']['TicketStatus'];
export type TicketPriorityValue = components['schemas']['TicketPriority'];

export type Ticket = components['schemas']['Ticket'];
export type TicketComment = components['schemas']['TicketComment'];
export type TicketDetail = components['schemas']['TicketDetail'];
export type CreateTicketInput = components['schemas']['CreateTicketRequest'];
export type KbArticle = components['schemas']['KbArticle'];
export type Asset = components['schemas']['Asset'];

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}
