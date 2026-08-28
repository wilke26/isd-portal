import { apiFetch } from './client.ts';
import type { ApiMessage, LoginResponse, User } from '../types/index.ts';

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });
}

export function me(): Promise<User> {
  return apiFetch<User>('/auth/me');
}

export function logout(): Promise<ApiMessage> {
  return apiFetch<ApiMessage>('/auth/logout', { method: 'POST' });
}
