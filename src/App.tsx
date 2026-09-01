import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LazyRouteErrorBoundary } from './components/LazyRouteErrorBoundary';
import { loadLazyRouteModule } from './lib/lazyRouteRecovery';
import { ProtectedRoute } from './routes/ProtectedRoute';

const LoginPage = lazy(() =>
  loadLazyRouteModule(() =>
    import('./pages/LoginPage').then(({ LoginPage }) => ({ default: LoginPage })),
  ),
);
const TicketsPage = lazy(() =>
  loadLazyRouteModule(() =>
    import('./pages/TicketsPage').then(({ TicketsPage }) => ({ default: TicketsPage })),
  ),
);
const NewTicketPage = lazy(() =>
  loadLazyRouteModule(() =>
    import('./pages/NewTicketPage').then(({ NewTicketPage }) => ({ default: NewTicketPage })),
  ),
);
const TicketDetailPage = lazy(() =>
  loadLazyRouteModule(() =>
    import('./pages/TicketDetailPage').then(({ TicketDetailPage }) => ({
      default: TicketDetailPage,
    })),
  ),
);
const KnowledgeBasePage = lazy(() =>
  loadLazyRouteModule(() =>
    import('./pages/KnowledgeBasePage').then(({ KnowledgeBasePage }) => ({
      default: KnowledgeBasePage,
    })),
  ),
);
const AssetsPage = lazy(() =>
  loadLazyRouteModule(() =>
    import('./pages/AssetsPage').then(({ AssetsPage }) => ({ default: AssetsPage })),
  ),
);

function PageLoading() {
  return (
    <div role="status" aria-live="polite" className="py-12 text-center text-sm text-slate-500">
      Seite wird geladen …
    </div>
  );
}

function lazyPage(page: ReactNode) {
  return (
    <LazyRouteErrorBoundary>
      <Suspense fallback={<PageLoading />}>{page}</Suspense>
    </LazyRouteErrorBoundary>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={lazyPage(<LoginPage />)} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/tickets" replace />} />
          <Route path="/tickets" element={lazyPage(<TicketsPage />)} />
          <Route path="/tickets/new" element={lazyPage(<NewTicketPage />)} />
          <Route path="/tickets/:id" element={lazyPage(<TicketDetailPage />)} />
          <Route path="/kb" element={lazyPage(<KnowledgeBasePage />)} />
          <Route path="/assets" element={lazyPage(<AssetsPage />)} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
}

export default App;
