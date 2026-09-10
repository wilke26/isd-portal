# isd-portal

**English** | [Deutsch](README.de.md)

A security-hardened React and TypeScript self-service portal for requesters using
the [`isd`](https://github.com/wilke26/isd) REST API. The portal has no independent
backend or persistence layer.

## Features

- [x] Sign in through `POST /auth/login`
- [x] List and view the requester's tickets
- [x] Create tickets and add public comments
- [x] Search published knowledge-base articles
- [x] Browse and search assets assigned to the requester
- [x] Restore and validate an existing browser-tab session
- [x] Log out remotely and clear all cached account data

File attachments, ticket state transitions, and administrative features are
deliberately outside the requester portal's current scope.

## Technology stack

- **React 19**, **TypeScript**, and **Vite**
- **React Router 7** for routes and protected-route redirects
- **TanStack Query** for all server state
- **Tailwind CSS 4** through `@tailwindcss/vite`
- **Vitest**, Testing Library, and MSW for unit and integration tests
- **Playwright** for browser and full-stack tests
- **Caddy** as the non-root production web server

Router data APIs are intentionally not used, avoiding a second data-fetching model
alongside TanStack Query. Authentication state remains small enough for React
context and local component state.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

The development server listens on `http://localhost:5173`. This origin is already
included in the backend's default local CORS configuration. Set
`VITE_API_BASE_URL` in `.env` if the API runs elsewhere.

## API contract

[`openapi/portal-v1.json`](openapi/portal-v1.json) is a vendored copy of the
backend-owned OpenAPI 3.1 contract. TypeScript models in
`src/types/generated/portal-v1.ts` are generated from this file and must not be
edited manually.

```bash
npm run api:generate
npm run api:check
```

CI fails if the committed generated types are stale. When the backend contract
changes, update the vendored schema, regenerate the types, and commit both files
together.

## Production container and browser security

The multi-stage production build compiles the static application with Node.js and
serves it from an unprivileged Caddy process. The runtime container is read-only,
drops Linux capabilities, and applies a restrictive Content Security Policy plus
additional browser security headers.

```bash
cp .env.example .env
docker compose up --build -d
curl -I http://127.0.0.1:8080
```

The portal is then available at `http://127.0.0.1:8080`. A deployment requires two
matching configuration values:

- `VITE_API_BASE_URL`: the complete API base URL embedded into the JavaScript at
  build time, for example `https://api.example.com/api/v1`
- `PORTAL_API_ORIGIN`: the origin of that URL for CSP `connect-src`, for example
  `https://api.example.com`

The public portal origin must also be present in the backend's
`CORS_ALLOWED_ORIGINS` list. Do not replace the allowlist with `*`. The production
CSP permits only local scripts and styles, blocks plugins and framing, and limits
network access to the configured API origin. External fonts, analytics, or other
destinations require an explicit change to `docker/Caddyfile` and corresponding
header tests.

## Authentication and residual risk

Authentication uses Laravel Sanctum bearer tokens rather than cookies. The token is
stored only in the current tab's `sessionStorage` by `src/lib/tokenStorage.ts`.
Legacy `localStorage` tokens are deleted and never migrated. Closing every browser
context containing a token copy ends the local session.

Browsers may clone `sessionStorage` when a tab is duplicated or when a same-origin
tab is opened with an opener. A successful XSS within the portal could also read
the bearer token. The decision, residual risks, and the intended future migration
to an httpOnly cookie are recorded in
[ADR 0001](docs/adr/0001-portal-auth-token-storage.md) (German).

Any API response with status 401 triggers centralized logout through
`onUnauthorized` in `src/api/client.ts` and `AuthContext.tsx`. On startup, the
portal validates a stored token through `GET /auth/me`. Logout calls
`POST /auth/logout` and then clears the entire TanStack Query cache so data cannot
leak between accounts.

## Source structure

```text
src/
├── api/          Resource-specific API functions and the shared fetch client
├── components/   Layout and reusable UI components
├── context/      Authentication context and user state
├── lib/          Environment configuration and token storage
├── pages/        One module per route
├── routes/       Protected-route redirects
└── types/        Shared and OpenAPI-generated TypeScript models
```

## Quality assurance

```bash
npm test
npm run lint -- --deny-warnings
npm run build
npm run bundle:check
npx playwright install chromium
npm run test:e2e
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080 npm run test:e2e:full-stack
npm audit --omit=dev --audit-level=high
```

Vitest, Testing Library, and MSW cover the API contract, login, session restoration,
ticket and asset lists, asset search, ticket creation, and logout. Playwright tests
the requester journey in Chromium. Setting
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080` runs the same browser test against an
already-running production container and verifies that the flow works under the
production CSP.

A separate CI job checks out the public backend repository and exercises login,
ticket creation, persistence after reload, and logout against the real Laravel API
and MySQL. It first verifies that the vendored OpenAPI document exactly matches the
backend contract. The checkout stores no credentials in the runner's local Git
configuration and requires no repository secret.

## Code splitting and bundle budgets

Each page is delivered as a separate lazy-loaded JavaScript chunk. After the
production build, `npm run bundle:check` evaluates the Vite manifest and enforces:

- all six page modules remain dynamic
- the compressed initial JavaScript is at most 90 KiB
- each route, including additional shared chunks in its static import closure,
  adds no more than 15 KiB

If an already-open client requests a stale hashed chunk after deployment, the
portal reloads the current application once. A repeated failure produces a stable
recovery screen rather than unmounting the UI. Missing static assets return HTTP
404 instead of the application shell.

## Current roadmap

The functional foundation is complete. Visual design and project-specific branding
remain intentionally neutral and are planned as a separate iteration.

## License

This project is available under the terms in [LICENSE](LICENSE).
