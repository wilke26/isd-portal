import { apiFetch } from './client.ts';
import type { Asset, Paginated } from '../types/index.ts';

export function listAssets(): Promise<Paginated<Asset>> {
  return apiFetch<Paginated<Asset>>('/assets');
}
