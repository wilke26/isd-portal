import type { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { Brand } from './Brand';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `group flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
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
  const navigate = useNavigate();

  const handleLogout = async () => {
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
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Brand />
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden items-center gap-2.5 border-r border-slate-200 pr-3 sm:flex">
                <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-800 ring-1 ring-brand-100">
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
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Abmelden
            </button>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <nav
            aria-label="Hauptnavigation"
            className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6"
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
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
