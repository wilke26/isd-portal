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

## Produktionscontainer und Browser-Sicherheit

Das Repository enthält einen Multi-Stage-Produktionsbuild. Node erzeugt die
statischen Dateien; ein unprivilegierter Caddy-Prozess liefert sie anschließend
mit einer restriktiven Content Security Policy und zusätzlichen Browser-
Sicherheitsheadern aus.

```bash
cp .env.example .env
docker compose up --build -d
curl -I http://127.0.0.1:8080
```

Das Portal ist danach unter `http://127.0.0.1:8080` erreichbar. Für ein echtes
Deployment müssen zwei zusammengehörige Werte gesetzt werden:

- `VITE_API_BASE_URL`: vollständige, beim Build in das JavaScript eingebettete
  API-Basis-URL, beispielsweise `https://api.example.com/api/v1`
- `PORTAL_API_ORIGIN`: reine Origin desselben Ziels für CSP `connect-src`,
  beispielsweise `https://api.example.com`

Im Backend muss die öffentlich ausgelieferte Portal-Origin gleichzeitig in
`CORS_ALLOWED_ORIGINS` stehen. Die Allowlist darf nicht durch `*` ersetzt
werden. Der Produktions-CSP erlaubt ausschließlich eigene Skripte und Styles,
verbietet Plugins und Framing und beschränkt Netzwerkzugriffe auf die explizite
API-Origin. Externe Fonts, Analytics oder weitere Ziele müssen bewusst in
`docker/Caddyfile` ergänzt und anschließend im Header-Smoke-Test abgesichert
werden.

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
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080 npm run test:e2e:full-stack
npm audit --omit=dev --audit-level=high
```

Mit `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080 npm run test:e2e` kann derselbe
Browser-Test gegen einen bereits laufenden Produktionscontainer ausgeführt
werden. In CI wird genau dieser Pfad genutzt, damit der Requester-Flow auch
unter der ausgelieferten CSP funktioniert.

Vitest, Testing Library und MSW decken API-Verträge, Login, Session-
Wiederherstellung, Ticketliste, Ticketanlage und Logout ab. Playwright prüft
denselben Requester-Ablauf zusätzlich in einem echten Chromium-Browser. Die
Browser-API wird dabei deterministisch geroutet. Ein separater CI-Job checkt
zusätzlich den aktuellen Backend-Stand aus und prüft Login, Ticketanlage,
Persistenz nach einem Reload und Logout gegen die echte Laravel-API und MySQL.
Vor dem Lauf wird außerdem sichergestellt, dass die vendorte OpenAPI-Datei mit
dem Backend-Vertrag identisch ist. Alle Prüfungen laufen bei Pushes und Pull
Requests.

Da `isd` ein privates, separates Repository ist, benötigt dieser CI-Job das
Repository-Secret `ISD_BACKEND_READ_TOKEN`. Hinterlegt wird ein Fine-grained
Personal Access Token, das ausschließlich für `wilke26/isd` gilt und dort nur
die Repository-Berechtigung **Contents: Read-only** besitzt. Der Checkout
speichert das Token nicht in der lokalen Git-Konfiguration des Runners.

## Nächste Schritte

1. Assets-Seite verdrahten (API-Funktion existiert bereits)
2. Visuelles Design/Branding ist in diesem Grundgerüst bewusst neutral
   gehalten — eigener Schritt, sobald die Feature-Basis steht
