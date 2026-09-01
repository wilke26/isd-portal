import { Component } from 'react';
import type { ReactNode } from 'react';
import { clearLazyRouteReloadAttempt, reloadPortal } from '../lib/lazyRouteRecovery';

interface LazyRouteErrorBoundaryProps {
  children: ReactNode;
  reload?: () => void;
}

interface LazyRouteErrorBoundaryState {
  failed: boolean;
}

export class LazyRouteErrorBoundary extends Component<
  LazyRouteErrorBoundaryProps,
  LazyRouteErrorBoundaryState
> {
  state: LazyRouteErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): LazyRouteErrorBoundaryState {
    return { failed: true };
  }

  private handleReload = () => {
    clearLazyRouteReloadAttempt();
    (this.props.reload ?? reloadPortal)();
  };

  render() {
    if (this.state.failed) {
      return (
        <main role="alert" className="mx-auto max-w-xl px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Seite konnte nicht geladen werden</h1>
          <p className="mt-3 text-sm text-slate-600">
            Möglicherweise wurde das Portal gerade aktualisiert. Bitte laden Sie die Anwendung neu.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Portal neu laden
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
