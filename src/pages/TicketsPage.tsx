import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listTickets } from '../api/tickets';
import { LoadingState, ErrorState } from '../components/QueryState';
import type { TicketStatus } from '../types';

const statusLabels: Record<TicketStatus, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  waiting: 'Wartet',
  resolved: 'Gelöst',
  closed: 'Geschlossen',
};

export function TicketsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: listTickets,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Meine Tickets</h1>
        <Link
          to="/tickets/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Neues Ticket
        </Link>
      </div>

      {isLoading && <LoadingState label="Tickets werden geladen …" />}
      {isError && <ErrorState message={error instanceof Error ? error.message : 'Tickets konnten nicht geladen werden.'} />}

      {data && data.data.length === 0 && (
        <p className="text-sm text-slate-500">Noch keine Tickets vorhanden.</p>
      )}

      {data && data.data.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {data.data.map((ticket) => (
            <li key={ticket.id}>
              <Link
                to={`/tickets/${ticket.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-900">{ticket.subject}</span>
                <span className="text-xs text-slate-500">{statusLabels[ticket.status]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
