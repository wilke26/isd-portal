export function LoadingState({ label = 'Wird geladen …' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm"
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse">
        <div className="h-3 w-28 rounded-full bg-slate-200" />
        <div className="h-4 w-2/3 rounded-full bg-slate-200" />
        <div className="h-3 w-1/2 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-red-800">
      <div className="flex gap-3">
        <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-red-100 font-bold">
          !
        </span>
        <div>
          <h2 className="text-sm font-bold">Das hat nicht geklappt</h2>
          <p className="mt-1 text-sm leading-6 text-red-700">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-bold text-red-800 transition hover:bg-red-100"
            >
              Erneut versuchen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SuccessMessage({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      <p className="flex gap-2 leading-6">
        <span aria-hidden="true" className="font-bold">✓</span>
        <span>{message}</span>
      </p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Erfolgsmeldung schließen"
          className="shrink-0 rounded p-1 font-bold text-emerald-700 hover:bg-emerald-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
