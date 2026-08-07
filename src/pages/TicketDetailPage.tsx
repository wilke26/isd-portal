import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { addComment, getTicket } from '../api/tickets';
import { LoadingState, ErrorState } from '../components/QueryState';
import { ApiError } from '../api/client';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState('');

  const { data: ticket, isLoading, isError, error } = useQuery({
    queryKey: ['tickets', ticketId],
    queryFn: () => getTicket(ticketId),
    enabled: Number.isFinite(ticketId),
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => addComment(ticketId, body),
    onSuccess: () => {
      setCommentBody('');
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
      <ErrorState message={error instanceof Error ? error.message : 'Ticket konnte nicht geladen werden.'} />
    );
  }
  if (!ticket) return null;

  return (
    <div className="max-w-2xl">
      <Link to="/tickets" className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-700">
        ← Zurück zu Tickets
      </Link>

      <h1 className="mb-1 text-xl font-semibold text-slate-900">{ticket.subject}</h1>
      <p className="mb-6 whitespace-pre-wrap text-sm text-slate-600">{ticket.description}</p>

      <h2 className="mb-3 text-sm font-semibold text-slate-900">Kommentare</h2>
      <ul className="mb-6 space-y-3">
        {ticket.comments.length === 0 && (
          <li className="text-sm text-slate-500">Noch keine Kommentare.</li>
        )}
        {ticket.comments.map((comment) => (
          <li key={comment.id} className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <div className="mb-1 text-xs font-medium text-slate-500">{comment.author.name}</div>
            <p className="text-sm text-slate-700">{comment.body}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmitComment} className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-medium text-slate-700">
          Kommentar hinzufügen
        </label>
        <textarea
          id="comment"
          rows={3}
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        {commentMutation.isError && (
          <p className="text-sm text-red-700">
            {commentMutation.error instanceof ApiError
              ? commentMutation.error.message
              : 'Kommentar konnte nicht gespeichert werden.'}
          </p>
        )}
        <button
          type="submit"
          disabled={commentMutation.isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {commentMutation.isPending ? 'Wird gesendet …' : 'Kommentar senden'}
        </button>
      </form>
    </div>
  );
}
