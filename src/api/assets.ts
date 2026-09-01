import { apiFetch } from './client.ts';
import type { Asset, Paginated } from '../types/index.ts';

export function listAssets(search = ''): Promise<Paginated<Asset>> {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set('search', search.trim());
  }

  const query = params.toString();

  return apiFetch<Paginated<Asset>>(`/assets${query ? `?${query}` : ''}`);
}
