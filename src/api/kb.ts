import { apiFetch } from './client';
import type { KbArticle, Paginated } from '../types';

export function listArticles(): Promise<Paginated<KbArticle>> {
  return apiFetch<Paginated<KbArticle>>('/kb/articles');
}
