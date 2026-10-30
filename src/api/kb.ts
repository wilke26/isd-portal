import { apiFetch } from './client.ts';
import type { KbArticle, Paginated } from '../types/index.ts';

export function listArticles(search = '', page = 1): Promise<Paginated<KbArticle>> {
  const query = new URLSearchParams();
  if (search.trim()) query.set('search', search.trim());
  if (page > 1) query.set('page', String(page));

  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return apiFetch<Paginated<KbArticle>>(`/kb/articles${suffix}`);
}
