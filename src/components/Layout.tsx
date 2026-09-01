import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold tracking-tight text-slate-900">isd-portal</span>
          <nav className="flex items-center gap-1">
            <NavLink to="/tickets" className={navLinkClass} end>
              Tickets
            </NavLink>
            <NavLink to="/tickets/new" className={navLinkClass}>
              Neues Ticket
            </NavLink>
            <NavLink to="/kb" className={navLinkClass}>
              Wissensdatenbank
            </NavLink>
            <NavLink to="/assets" className={navLinkClass}>
              Assets
            </NavLink>
          </nav>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            {user && <span>{user.name}</span>}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-100"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
