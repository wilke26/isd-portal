import { apiFetch } from './client.ts';
import type { KbArticle, Paginated } from '../types/index.ts';

export function listArticles(search = ''): Promise<Paginated<KbArticle>> {
  const query = new URLSearchParams();
  if (search.trim()) query.set('search', search.trim());

  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return apiFetch<Paginated<KbArticle>>(`/kb/articles${suffix}`);
}
