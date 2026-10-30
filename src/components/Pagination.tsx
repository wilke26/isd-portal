interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <nav
      aria-label="Seitennavigation"
      className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Zurück
      </button>
      <p aria-live="polite" className="text-center text-sm font-semibold text-slate-600">
        Seite <span className="text-ink-950">{currentPage}</span> von{' '}
        <span className="text-ink-950">{lastPage}</span>
      </p>
      <button
        type="button"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Weiter →
      </button>
    </nav>
  );
}
