import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useBeforeUnload, useBlocker, useNavigate } from 'react-router-dom';
import { createTicket } from '../api/tickets';
import { ApiError } from '../api/client';
import { useUnsavedChanges } from '../context/unsaved-changes-context';
import type { TicketPriorityValue } from '../types';

const titleMaxLength = 255;

type FieldName = 'title' | 'description';
type ClientErrors = Partial<Record<FieldName, string>>;

function apiFieldError(error: unknown, field: FieldName) {
  if (!(error instanceof ApiError) || error.status !== 422) return undefined;
  if (!error.body || typeof error.body !== 'object' || !('errors' in error.body)) return undefined;

  const errors = (error.body as { errors?: unknown }).errors;
  if (!errors || typeof errors !== 'object' || !(field in errors)) return undefined;

  const messages = (errors as Record<string, unknown>)[field];
  return Array.isArray(messages) && typeof messages[0] === 'string' ? messages[0] : undefined;
}

export function NewTicketPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { discardUnsavedChanges, hasUnsavedChanges, setUnsavedChanges } = useUnsavedChanges();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriorityValue>('medium');
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});
  const isDirty = title.length > 0 || description.length > 0 || priority !== 'medium';
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges() && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    setUnsavedChanges(isDirty);
  }, [isDirty, setUnsavedChanges]);

  useEffect(
    () => () => {
      discardUnsavedChanges();
    },
    [discardUnsavedChanges],
  );

  useBeforeUnload(
    useCallback(
      (event) => {
        if (hasUnsavedChanges()) event.preventDefault();
      },
      [hasUnsavedChanges],
    ),
  );

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      discardUnsavedChanges();
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      navigate(`/tickets/${ticket.id}`, {
        state: { successMessage: 'Dein Ticket wurde erfolgreich erstellt.' },
      });
    },
  });

  const titleError = clientErrors.title ?? apiFieldError(mutation.error, 'title');
  const descriptionError = clientErrors.description ?? apiFieldError(mutation.error, 'description');
  const hasFieldApiError = Boolean(
    apiFieldError(mutation.error, 'title') || apiFieldError(mutation.error, 'description'),
  );

  const resetError = (field: FieldName) => {
    setClientErrors((current) => ({ ...current, [field]: undefined }));
    if (mutation.isError) mutation.reset();
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    resetError('title');
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
    resetError('description');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (mutation.isPending) return;

    const errors: ClientErrors = {};
    if (!title.trim()) errors.title = 'Bitte gib einen aussagekräftigen Betreff ein.';
    if (!description.trim()) errors.description = 'Bitte beschreibe dein Anliegen.';

    setClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    mutation.mutate({ title: title.trim(), description: description.trim(), priority });
  };

  const discardAndLeave = () => {
    discardUnsavedChanges();
    if (blocker.state === 'blocked') blocker.proceed();
  };

  const keepEditing = () => {
    if (blocker.state === 'blocked') blocker.reset();
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      keepEditing();
      return;
    }

    if (event.key !== 'Tab') return;

    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
    );
    const firstButton = buttons[0];
    const lastButton = buttons.at(-1);

    if (event.shiftKey && document.activeElement === firstButton) {
      event.preventDefault();
      lastButton?.focus();
    } else if (!event.shiftKey && document.activeElement === lastButton) {
      event.preventDefault();
      firstButton?.focus();
    }
  };

  return (
    <div>
      <Link to="/tickets" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-800">
        <span aria-hidden="true">←</span> Zurück zu meinen Tickets
      </Link>

      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
          Neue Serviceanfrage
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-950">Neues Ticket</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Beschreibe kurz, wobei du Unterstützung benötigst. Je genauer die Angaben, desto schneller kann dein Anliegen eingeordnet werden.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="title" className="block text-sm font-bold text-slate-700">
                  Betreff
                </label>
                <span className="text-xs tabular-nums text-slate-400">
                  {title.length}/{titleMaxLength}
                </span>
              </div>
              <p id="title-help" className="mt-1 text-xs leading-5 text-slate-500">
                Fasse das Problem in einem kurzen Satz zusammen.
              </p>
              <input
                id="title"
                required
                maxLength={titleMaxLength}
                autoFocus
                value={title}
                onChange={handleTitleChange}
                aria-invalid={Boolean(titleError)}
                aria-describedby={titleError ? 'title-help title-error' : 'title-help'}
                placeholder="Zum Beispiel: VPN-Verbindung bricht ab"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-100 aria-invalid:border-red-400 aria-invalid:ring-red-100"
              />
              {titleError && <p id="title-error" className="mt-2 text-sm text-red-700">{titleError}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="description" className="block text-sm font-bold text-slate-700">
                  Beschreibung
                </label>
                <span className="text-xs tabular-nums text-slate-400">{description.length} Zeichen</span>
              </div>
              <p id="description-help" className="mt-1 text-xs leading-5 text-slate-500">
                Was ist passiert, seit wann besteht das Problem und was hast du bereits versucht?
              </p>
              <textarea
                id="description"
                required
                rows={8}
                value={description}
                onChange={handleDescriptionChange}
                aria-invalid={Boolean(descriptionError)}
                aria-describedby={descriptionError ? 'description-help description-error' : 'description-help'}
                placeholder="Beschreibe das Anliegen so konkret wie möglich …"
                className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm leading-6 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-100 aria-invalid:border-red-400 aria-invalid:ring-red-100"
              />
              {descriptionError && <p id="description-error" className="mt-2 text-sm text-red-700">{descriptionError}</p>}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-bold text-slate-700">
                Priorität
              </label>
              <p id="priority-help" className="mt-1 text-xs leading-5 text-slate-500">
                Wähle die Auswirkung auf deine aktuelle Arbeit.
              </p>
              <select
                id="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TicketPriorityValue)}
                aria-describedby="priority-help"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-100 sm:max-w-xs"
              >
                <option value="low">Niedrig – keine unmittelbare Einschränkung</option>
                <option value="medium">Mittel – Arbeit ist eingeschränkt</option>
                <option value="high">Hoch – wichtige Arbeit ist blockiert</option>
                <option value="critical">Kritisch – vollständiger Ausfall</option>
              </select>
            </div>
          </div>

          {mutation.isError && !hasFieldApiError && (
            <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {mutation.error instanceof ApiError
                ? mutation.error.message
                : 'Ticket konnte nicht erstellt werden.'}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Link
              to="/tickets"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? 'Ticket wird erstellt …' : 'Ticket erstellen'}
            </button>
          </div>
        </form>

        <aside aria-labelledby="ticket-tips-heading" className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
          <h2 id="ticket-tips-heading" className="text-sm font-bold text-brand-900">Das hilft bei der Bearbeitung</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-brand-900/80">
            <li className="flex gap-2"><span aria-hidden="true">•</span><span>Genaue Fehlermeldung oder beobachtetes Verhalten</span></li>
            <li className="flex gap-2"><span aria-hidden="true">•</span><span>Betroffene Anwendung oder betroffenes Gerät</span></li>
            <li className="flex gap-2"><span aria-hidden="true">•</span><span>Zeitpunkt und Häufigkeit des Problems</span></li>
          </ul>
          <p className="mt-5 border-t border-brand-200 pt-4 text-xs leading-5 text-brand-800">
            Nach dem Erstellen kannst du weitere Informationen als Kommentar ergänzen.
          </p>
        </aside>
      </div>

      {blocker.state === 'blocked' && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/60 p-4 backdrop-blur-sm"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="discard-ticket-heading"
            aria-describedby="discard-ticket-description"
            onKeyDown={handleDialogKeyDown}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              Ungespeicherte Änderungen
            </p>
            <h2 id="discard-ticket-heading" className="mt-2 text-xl font-bold text-ink-950">
              Ticketentwurf verwerfen?
            </h2>
            <p id="discard-ticket-description" className="mt-3 text-sm leading-6 text-slate-600">
              Deine bisherigen Eingaben gehen verloren, wenn du diese Seite verlässt.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={discardAndLeave}
                className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
              >
                Entwurf verwerfen
              </button>
              <button
                type="button"
                autoFocus
                onClick={keepEditing}
                className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800"
              >
                Weiter bearbeiten
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
