import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listTickets } from '../api/tickets';
import { LoadingState, ErrorState } from '../components/QueryState';
import { FormattedDate, TicketPriority, TicketStatusBadge } from '../components/TicketPresentation';

export function TicketsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: listTickets,
  });

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            Serviceanfragen
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-950">Meine Tickets</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Verfolge deine offenen Anfragen und sieh jederzeit den aktuellen Bearbeitungsstand.
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <span className="text-lg leading-none" aria-hidden="true">+</span>
          Neues Ticket
        </Link>
      </div>

      {isLoading && <LoadingState label="Tickets werden geladen …" />}
      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Tickets konnten nicht geladen werden.'}
          onRetry={() => void refetch()}
        />
      )}

      {data && data.data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-full bg-brand-50 text-xl text-brand-700">
            <span aria-hidden="true">✓</span>
          </div>
          <h2 className="mt-4 text-base font-bold text-ink-950">Keine offenen Anfragen</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Sobald du ein Ticket erstellst, erscheint es hier mit seinem aktuellen Status.
          </p>
          <Link
            to="/tickets/new"
            className="mt-5 inline-flex text-sm font-bold text-brand-700 hover:text-brand-900"
          >
            Erste Anfrage erstellen →
          </Link>
        </div>
      )}

      {data && data.data.length > 0 && (
        <section aria-labelledby="ticket-list-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 id="ticket-list-heading" className="text-sm font-bold text-ink-950">
              Aktuelle Anfragen
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              {data.meta.total} {data.meta.total === 1 ? 'Ticket' : 'Tickets'}
            </span>
          </div>
          <ul className="divide-y divide-slate-200">
            {data.data.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="group block px-5 py-5 transition hover:bg-slate-50 sm:px-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{ticket.id}</span>
                        <TicketStatusBadge value={ticket.status.value} label={ticket.status.label} />
                      </div>
                      <h3 className="mt-2 truncate text-base font-bold text-ink-950 transition group-hover:text-brand-800">
                        {ticket.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-600">
                        {ticket.description}
                      </p>
                    </div>
                    <span className="hidden pt-1 text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-700 sm:block" aria-hidden="true">
                      →
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3">
                    <TicketPriority value={ticket.priority.value} label={ticket.priority.label} />
                    <span className="text-xs text-slate-500">
                      {ticket.category?.name ?? 'Ohne Kategorie'}
                    </span>
                    <span className="text-xs text-slate-500">
                      Aktualisiert <FormattedDate value={ticket.updated_at} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
