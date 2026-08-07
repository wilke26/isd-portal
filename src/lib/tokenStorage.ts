/**
 * Kapselt, WO der Auth-Token abgelegt wird.
 *
 * Aktuell: localStorage. Das ist der pragmatische Ansatz für Token-basiertes
 * Sanctum ohne Refresh-Flow, hat aber den bekannten Trade-off, dass
 * localStorage über XSS auslesbar ist. Wenn das relevant wird, ist dies
 * die einzige Stelle, die angepasst werden muss (z. B. auf In-Memory +
 * stillen Re-Login beim Neuladen umstellen).
 */
const TOKEN_KEY = 'isd_portal_token';

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};
