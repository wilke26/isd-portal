/**
 * Kapselt, WO der Auth-Token abgelegt wird.
 *
 * Der Token bleibt nur für die Lebensdauer des Browser-Tabs erhalten. Das
 * reduziert die Persistenz auf gemeinsam genutzten Geräten, schützt den Token
 * aber nicht vor JavaScript, das bereits im Portal ausgeführt wird. Die
 * verbleibende XSS-Abwägung und der spätere Cookie-Zielzustand sind in ADR
 * 0001 dokumentiert.
 */
const TOKEN_KEY = 'isd_portal_token';

export const tokenStorage = {
  get(): string | null {
    clearLegacyToken();
    return sessionStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    clearLegacyToken();
    sessionStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    clearLegacyToken();
  },
};

function clearLegacyToken(): void {
  // Persistente Tokens aus Versionen vor ADR 0001 werden bewusst verworfen
  // und nicht in den neuen Speicher übernommen.
  localStorage.removeItem(TOKEN_KEY);
}
