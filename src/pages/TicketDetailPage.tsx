import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { addComment, getTicket } from '../api/tickets';
import { LoadingState, ErrorState, SuccessMessage } from '../components/QueryState';
import { ApiError } from '../api/client';
import { FormattedDate, TicketPriority, TicketStatusBadge } from '../components/TicketPresentation';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [commentBody, setCommentBody] = useState('');
  const navigationMessage = (location.state as { successMessage?: unknown } | null)?.successMessage;
  const [successMessage, setSuccessMessage] = useState(
    typeof navigationMessage === 'string' ? navigationMessage : null,
  );

  const { data: ticket, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tickets', ticketId],
    queryFn: () => getTicket(ticketId),
    enabled: Number.isFinite(ticketId),
  });

  useEffect(() => {
    if (typeof navigationMessage === 'string') {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, navigate, navigationMessage]);

  const commentMutation = useMutation({
    mutationFn: (body: string) => addComment(ticketId, body),
    onSuccess: () => {
      setCommentBody('');
      setSuccessMessage('Dein Kommentar wurde gespeichert.');
      queryClient.invalidateQueries({ queryKey: ['tickets', ticketId] });
    },
  });

  const handleSubmitComment = (event: FormEvent) => {
    event.preventDefault();
    if (!commentBody.trim()) return;
    commentMutation.mutate(commentBody);
  };

  if (isLoading) return <LoadingState label="Ticket wird geladen …" />;
  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Ticket konnte nicht geladen werden.'}
        onRetry={() => void refetch()}
      />
    );
  }
  if (!ticket) return null;

  return (
    <div>
      {successMessage && (
        <div className="mb-5">
          <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage(null)} />
        </div>
      )}

      <Link to="/tickets" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-800">
        <span aria-hidden="true">←</span> Zurück zu meinen Tickets
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Ticket #{ticket.id}</span>
              <TicketStatusBadge value={ticket.status.value} label={ticket.status.label} />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-950">{ticket.title}</h1>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{ticket.description}</p>
          </article>

          <section aria-labelledby="comments-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 id="comments-heading" className="text-base font-bold text-ink-950">Verlauf</h2>
              <span className="text-xs font-semibold text-slate-400">
                {ticket.comments.length} {ticket.comments.length === 1 ? 'Kommentar' : 'Kommentare'}
              </span>
            </div>
            <ul className="my-6 space-y-4">
              {ticket.comments.length === 0 && (
                <li className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Noch keine Kommentare. Ergänze bei Bedarf weitere Informationen.
                </li>
              )}
              {ticket.comments.map((comment) => (
                <li key={comment.id} className="border-l-2 border-brand-200 pl-4">
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                    <span className="font-bold text-slate-700">{comment.user.name}</span>
                    <FormattedDate value={comment.created_at} />
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.body}</p>
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmitComment} className="border-t border-slate-200 pt-5">
              <label htmlFor="comment" className="block text-sm font-bold text-slate-700">
                Kommentar hinzufügen
              </label>
              <textarea
                id="comment"
                rows={4}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Weitere Informationen zu deiner Anfrage …"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-100"
              />
              {commentMutation.isError && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  {commentMutation.error instanceof ApiError
                    ? commentMutation.error.message
                    : 'Kommentar konnte nicht gespeichert werden.'}
                </p>
              )}
              <button
                type="submit"
                disabled={commentMutation.isPending || !commentBody.trim()}
                className="mt-3 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {commentMutation.isPending ? 'Wird gesendet …' : 'Kommentar senden'}
              </button>
            </form>
          </section>
        </div>

        <aside aria-label="Ticketdetails" className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-ink-950">Ticketdetails</h2>
          <dl className="mt-4 divide-y divide-slate-100">
            <div className="py-3 first:pt-0">
              <dt className="text-xs font-semibold text-slate-400">Priorität</dt>
              <dd className="mt-1"><TicketPriority value={ticket.priority.value} label={ticket.priority.label} /></dd>
            </div>
            <div className="py-3">
              <dt className="text-xs font-semibold text-slate-400">Kategorie</dt>
              <dd className="mt-1 text-sm font-medium text-slate-700">{ticket.category?.name ?? 'Nicht zugeordnet'}</dd>
            </div>
            <div className="py-3">
              <dt className="text-xs font-semibold text-slate-400">Bearbeitung</dt>
              <dd className="mt-1 text-sm font-medium text-slate-700">{ticket.assignee?.name ?? 'Noch nicht zugewiesen'}</dd>
            </div>
            <div className="py-3">
              <dt className="text-xs font-semibold text-slate-400">Erstellt</dt>
              <dd className="mt-1 text-sm text-slate-600"><FormattedDate value={ticket.created_at} /></dd>
            </div>
            <div className="py-3 pb-0">
              <dt className="text-xs font-semibold text-slate-400">Zuletzt aktualisiert</dt>
              <dd className="mt-1 text-sm text-slate-600"><FormattedDate value={ticket.updated_at} /></dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
