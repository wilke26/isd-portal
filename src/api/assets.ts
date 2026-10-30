import { apiFetch } from './client.ts';
import type { Asset, Paginated } from '../types/index.ts';

export function listAssets(search = '', page = 1): Promise<Paginated<Asset>> {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set('search', search.trim());
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const query = params.toString();

  return apiFetch<Paginated<Asset>>(`/assets${query ? `?${query}` : ''}`);
}
