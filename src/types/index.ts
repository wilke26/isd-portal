/**
 * WICHTIG: Diese Typen sind aus dem Projekt-Brief abgeleitete Annahmen,
 * nicht aus der echten isd-API-Response generiert (kein OpenAPI-Schema
 * zur Hand). Vor dem ersten echten API-Aufruf gegen die tatsächlichen
 * Responses abgleichen und anpassen — im Zweifel Feldnamen in den
 * Browser-DevTools (Network-Tab) gegenprüfen.
 *
 * Falls isd ein OpenAPI/Swagger-Schema bereitstellt, lohnt es sich, diese
 * Datei stattdessen per `openapi-typescript` zu generieren.
 */

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

export interface Ticket {
  id: number;
  subject: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  body: string;
  author: Pick<User, 'id' | 'name'>;
  created_at: string;
}

export interface TicketDetail extends Ticket {
  description: string;
  comments: TicketComment[];
}

export interface CreateTicketInput {
  subject: string;
  description: string;
}

export interface KbArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  updated_at: string;
}

export interface Asset {
  id: number;
  name: string;
  asset_tag: string;
  category: string;
}

/** Generische Paginierungs-Hülle — Annahme: Laravel-Standard-Pagination. */
export interface Paginated<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}
