import { config } from '../lib/config.ts';
import { tokenStorage } from '../lib/tokenStorage.ts';

/**
 * Wird geworfen, wenn die API mit einem Fehlerstatus antwortet.
 * `status` und `body` werden durchgereicht, damit einzelne Aufrufer
 * (z. B. ein Login-Formular) gezielt auf 422-Validierungsfehler o. Ä.
 * reagieren können, statt nur eine generische Fehlermeldung zu zeigen.
 */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Wird ausgelöst, wenn die API mit 401 antwortet — z. B. weil der Token
 * abgelaufen oder ungültig ist. AuthContext hört auf dieses Event, um
 * zentral auszuloggen, ohne dass api/client.ts den AuthContext importieren
 * müsste (das würde einen Zirkelbezug erzeugen).
 */
const UNAUTHORIZED_EVENT = 'isd-portal:unauthorized';

export function onUnauthorized(handler: () => void): () => void {
  const listener = () => handler();
  window.addEventListener(UNAUTHORIZED_EVENT, listener);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, listener);
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Für /auth/login: hier gibt es noch keinen Token zum Mitschicken. */
  skipAuth?: boolean;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuth = false } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (!skipAuth) {
    const token = tokenStorage.get();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && !skipAuth) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  // 204 No Content o. Ä. — kein JSON-Body zu parsen.
  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: unknown }).message)
        : undefined) ?? `Anfrage fehlgeschlagen (${response.status})`;
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}
