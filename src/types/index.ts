export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiMessage {
  message: string;
}

export interface ApiResource<T> {
  data: T;
}

export type TicketStatusValue =
  | 'open'
  | 'in_progress'
  | 'waiting_for_requester'
  | 'resolved'
  | 'closed';

export type TicketPriorityValue = 'low' | 'medium' | 'high' | 'critical';

export interface EnumPresentation<T extends string> {
  value: T;
  label: string;
  color: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: EnumPresentation<TicketStatusValue>;
  priority: EnumPresentation<TicketPriorityValue>;
  requester: User;
  assignee: User | null;
  category: { id: number; name: string } | null;
  asset: Pick<Asset, 'id' | 'asset_tag' | 'name'> | null;
  due_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketComment {
  id: number;
  body: string;
  is_internal: boolean;
  user: User;
  created_at: string;
}

export interface TicketDetail extends Ticket {
  comments: TicketComment[];
}

export interface CreateTicketInput {
  title: string;
  description: string;
  asset_id?: number | null;
}

export interface KbArticle {
  id: number;
  title: string;
  slug: string;
  body: string;
  addendum: string | null;
  status: { value: 'draft' | 'submitted' | 'published' | 'archived'; label: string };
  author: User;
  category: { id: number; name: string; slug: string } | null;
  tags: Array<{ id: number; name: string; slug: string }>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: number;
  name: string;
  asset_tag: string;
  category: { id: number; name: string } | null;
}

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
