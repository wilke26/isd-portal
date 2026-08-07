import { apiFetch } from './client';
import type { Asset, Paginated } from '../types';

export function listAssets(): Promise<Paginated<Asset>> {
  return apiFetch<Paginated<Asset>>('/assets');
}
