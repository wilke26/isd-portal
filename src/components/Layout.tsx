import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { useUnsavedChanges } from '../context/unsaved-changes-context';
import { Brand } from './Brand';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `group flex w-full shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:w-auto ${
    isActive
      ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-100'
      : 'text-slate-600 hover:bg-slate-100 hover:text-ink-950'
  }`;

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4.5 opacity-80"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const { discardUnsavedChanges, hasUnsavedChanges } = useUnsavedChanges();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mainContentRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    mainContentRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      navigationRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    }
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    mobileMenuButtonRef.current?.focus();
  };

  const handleMobileMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (mobileMenuOpen && event.key === 'Escape') {
      event.preventDefault();
      closeMobileMenu();
    }
  };

  const handleLogout = async () => {
    if (
      hasUnsavedChanges()
      && !window.confirm('Dein Ticketentwurf wurde noch nicht gespeichert. Trotzdem abmelden?')
    ) {
      return;
    }

    discardUnsavedChanges();
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-slate-50">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-50 -translate-y-20 rounded-lg bg-ink-950 px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2"
      >
        Zum Hauptinhalt
      </a>
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Brand />
          <button
            ref={mobileMenuButtonRef}
            type="button"
            aria-controls="primary-navigation-panel"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Navigation schließen' : 'Navigation öffnen'}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-4.5"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path d="m6 6 12 12M18 6 6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
            Menü
          </button>
        </div>
        <div
          id="primary-navigation-panel"
          onKeyDown={handleMobileMenuKeyDown}
          className={`${mobileMenuOpen ? 'block' : 'hidden'} border-t border-slate-100 sm:block`}
        >
          <div className="mx-auto max-w-6xl px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-2">
            <nav
              ref={navigationRef}
              aria-label="Hauptnavigation"
              className="flex flex-col gap-1 sm:flex-row"
            >
              <NavLink to="/tickets" className={navLinkClass} end>
                <NavIcon>
                  <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5z" />
                </NavIcon>
                Tickets
              </NavLink>
              <NavLink to="/tickets/new" className={navLinkClass}>
                <NavIcon>
                  <path d="M12 5v14M5 12h14" />
                </NavIcon>
                Neues Ticket
              </NavLink>
              <NavLink to="/kb" className={navLinkClass}>
                <NavIcon>
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
                </NavIcon>
                Wissensdatenbank
              </NavLink>
              <NavLink to="/assets" className={navLinkClass}>
                <NavIcon>
                  <rect x="4" y="5" width="16" height="12" rx="2" />
                  <path d="M9 21h6M12 17v4" />
                </NavIcon>
                Assets
              </NavLink>
            </nav>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3 sm:mt-0 sm:justify-end sm:border-0 sm:pt-0">
              {user && (
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-800 ring-1 ring-brand-100">
                    {initials || 'IS'}
                  </span>
                  <span className="max-w-40 truncate text-sm font-medium text-slate-700">
                    {user.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>
      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-8 focus:outline-none sm:px-6 sm:py-10"
      >
        <Outlet />
      </main>
    </div>
  );
}
