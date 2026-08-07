# isd-portal

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

Läuft dann auf `http://localhost:5173`.

**Offener Punkt auf `isd`-Seite:** Die CORS-Konfiguration von `isd`
(`config/cors.php`) muss den Vite-Dev-Server-Origin kennen, bevor das Portal
lokal wirklich gegen `isd` sprechen kann. Das ist eine Änderung am
`isd`-Projekt, nicht an diesem Repo.

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
- [x] Wissensdatenbank durchsuchen (`GET /kb/articles`, nur lesend,
      Suche aktuell clientseitig gefiltert)
- [ ] Eigene Assets ansehen (`GET /assets`) — API-Funktion
      (`src/api/assets.ts`) existiert bereits, Seite/Route noch nicht
      verdrahtet (laut Brief niedrigere Priorität)

Bewusst nicht enthalten (siehe Brief): Datei-Anhänge, Status ändern,
jede Art von Verwaltungsfunktion.

## Wichtige Annahme, die noch zu verifizieren ist

Die Typen in `src/types/index.ts` (z. B. Form der `/auth/login`-Response,
Paginierungs-Hülle) sind aus dem Brief abgeleitet, nicht aus einer echten
API-Response oder einem OpenAPI-Schema generiert — es lag keins vor. Vor dem
ersten echten Request gegen die tatsächlichen Response-Shapes prüfen
(Network-Tab) und anpassen. Falls `isd` ein OpenAPI/Swagger-Schema
bereitstellt, lohnt es sich, diese Datei stattdessen z. B. per
`openapi-typescript` zu generieren.

## Bekannte, akzeptierte Punkte

- `npm run lint` meldet eine Warnung zu `AuthContext.tsx`
  (`react/only-export-components`, Fast-Refresh-Hinweis) — Standardmuster
  bei Context+Hook in einer Datei, unkritisch.
- `npm audit` zeigt eine offene `react-router`-Advisory (RSC-Mode-CSRF).
  Betrifft nur den React-Router-RSC/Framework-Modus, den dieses Projekt
  nicht verwendet (reine Client-SPA mit `<Routes>`).

## Nächste Schritte

1. Gegen echte `isd`-Instanz testen, Typen in `src/types/index.ts`
   verifizieren/anpassen
2. Assets-Seite verdrahten (API-Funktion existiert bereits)
3. Visuelles Design/Branding ist in diesem Grundgerüst bewusst neutral
   gehalten — eigener Schritt, sobald die Feature-Basis steht
