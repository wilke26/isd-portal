# isd-portal

## API contract

`openapi/portal-v1.json` is a vendored copy of the backend-owned OpenAPI 3.1
contract. TypeScript models in `src/types/generated/portal-v1.ts` are generated
from that document and must not be edited manually.

```bash
npm run api:generate
npm run api:check
```

CI fails when the checked-in generated types are out of date. When the backend
contract changes, update the vendored schema first, regenerate the types, and
commit both files together.

Self-Service-Portal für Requester, das gegen die bestehende `isd`-REST-API
(`/api/v1`) spricht. Kein eigenes Backend, keine eigene Datenhaltung — siehe
Projekt-Brief für Hintergrund und Entscheidungen.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **React Router 7** — reines Routing (Pfade, `ProtectedRoute`), bewusst
  *ohne* die Router-eigenen Data-APIs (Loader), um nicht zwei
  Fetching-Paradigmen parallel zu haben
- **TanStack Query** — für sämtliches Laden/Mutieren von Server-State
- **Tailwind CSS v4** (über `@tailwindcss/vite`, kein separates
  `tailwind.config.js` nötig)
- Client-State (Auth) über `useState`/`useContext` — für den aktuellen
  Umfang ausreichend

## Setup

```bash
npm install
cp .env.example .env   # bei Bedarf VITE_API_BASE_URL anpassen
npm run dev
```

Läuft dann auf `http://localhost:5173`. Dieser Origin ist in der
`isd`-CORS-Konfiguration bereits für die lokale Entwicklung freigegeben.

## Auth

Token-basiert (Sanctum Bearer-Token), konsistent mit dem Rest der API — kein
Cookie-/Session-Modus. Der Token liegt in `localStorage`
(`src/lib/tokenStorage.ts`); das ist der pragmatische Ansatz ohne
Refresh-Flow, hat aber den bekannten XSS-Trade-off. Bei Bedarf ist
`tokenStorage.ts` die einzige Stelle, die für eine andere Strategie
angepasst werden müsste.

Bei einer 401-Antwort von der API wird zentral ausgeloggt (Event-basiert,
siehe `onUnauthorized` in `src/api/client.ts` + `AuthContext.tsx`), damit
`api/client.ts` nicht direkt von `AuthContext` abhängen muss.
Beim App-Start wird ein vorhandener Token mit `GET /auth/me` validiert. Das
Abmelden ruft `POST /auth/logout` auf und leert anschließend den gesamten
TanStack-Query-Cache, damit keine Daten zwischen Benutzerkonten bestehen
bleiben.

## Struktur

```
src/
  api/            API-Aufrufe pro Ressource (auth, tickets, kb, assets)
                  + client.ts (Fetch-Wrapper: Base-URL, Bearer-Header, Fehler)
  context/        AuthContext (Token/User-State, Login/Logout)
  routes/         ProtectedRoute (Redirect zu /login ohne Auth)
  components/     Layout (Nav), kleine geteilte UI-Bausteine
  pages/          Eine Datei pro Route
  types/          Geteilte TS-Typen für API-Ressourcen
  lib/            config.ts (Env), tokenStorage.ts
```

## Umgesetzte Features (MVP)

- [x] Login (`POST /auth/login`)
- [x] Eigene Tickets — Liste (`GET /tickets`) + Detail (`GET /tickets/:id`)
- [x] Ticket erstellen (`POST /tickets`)
- [x] Kommentar hinzufügen (`POST /tickets/:id/comments`)
- [x] Wissensdatenbank durchsuchen (`GET /kb/articles?search=...`, nur lesend)
- [ ] Eigene Assets ansehen (`GET /assets`) — API-Funktion
      (`src/api/assets.ts`) existiert bereits, Seite/Route noch nicht
      verdrahtet (laut Brief niedrigere Priorität)

Bewusst nicht enthalten (siehe Brief): Datei-Anhänge, Status ändern,
jede Art von Verwaltungsfunktion.

## Qualitätssicherung

```bash
npm test
npm run lint -- --deny-warnings
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev --audit-level=high
```

Vitest, Testing Library und MSW decken API-Verträge, Login, Session-
Wiederherstellung, Ticketliste, Ticketanlage und Logout ab. Playwright prüft
denselben Requester-Ablauf zusätzlich in einem echten Chromium-Browser. Die
Browser-API wird dabei deterministisch geroutet; ein gemeinsamer E2E-Lauf gegen
den echten Docker-Stack bleibt eine separate Integrationsstufe. Alle Prüfungen
laufen in GitHub Actions bei Pushes und Pull Requests.

## Nächste Schritte

1. Gemeinsamen E2E-Lauf gegen den echten Backend-/Portal-Docker-Stack ergänzen
2. Assets-Seite verdrahten (API-Funktion existiert bereits)
3. Visuelles Design/Branding ist in diesem Grundgerüst bewusst neutral
   gehalten — eigener Schritt, sobald die Feature-Basis steht
