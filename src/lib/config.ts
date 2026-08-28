/**
 * Zentrale Konfiguration, aus Umgebungsvariablen gelesen.
 * Siehe .env.example für die verfügbaren Variablen.
 */
export const config = {
  apiBaseUrl: import.meta.env?.VITE_API_BASE_URL ?? 'https://isd.local/api/v1',
} as const;
