import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { ApiError } from '../api/client';
import { Brand } from '../components/Brand';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    const redirectTo = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/tickets';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/tickets', { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-slate-50 lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      <section className="relative hidden overflow-hidden bg-ink-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 size-[30rem] rounded-full bg-blue-600/15 blur-3xl" />
        <div className="relative">
          <Brand inverse />
        </div>
        <div className="relative max-w-xl pb-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-brand-200">
            Support. Wissen. Ausstattung.
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            IT-Service, der den Arbeitsalltag einfach macht.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
            Melde Störungen, verfolge deine Anfragen und finde Antworten zentral an einem Ort.
          </p>
          <div className="mt-10 flex gap-6 border-t border-white/10 pt-6 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400" /> Sicher verbunden
            </span>
            <span>Persönlicher Servicebereich</span>
          </div>
        </div>
      </section>

      <section className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-cyan-400 to-blue-500 lg:hidden" />
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.35)] sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Willkommen</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-950">Beim ISD Portal anmelden</h2>
            <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">
              Verwende deine Zugangsdaten für den IT Service Desk.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  E-Mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink-950 shadow-sm transition placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-100"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Passwort
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink-950 shadow-sm transition focus:border-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-100"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Wird angemeldet …' : 'Anmelden'}
              </button>
            </form>
          </div>
          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Bei Problemen mit der Anmeldung wende dich an deinen IT-Service.
          </p>
        </div>
      </section>
    </main>
  );
}
