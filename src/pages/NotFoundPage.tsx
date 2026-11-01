import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Fehler 404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-950">
        Seite nicht gefunden
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-600">
        Die aufgerufene Adresse existiert nicht oder wurde verschoben. Kehre zu deinen Tickets
        zurück und starte von dort neu.
      </p>
      <Link
        to="/tickets"
        className="mt-7 inline-flex rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        Zu meinen Tickets
      </Link>
    </section>
  );
}
