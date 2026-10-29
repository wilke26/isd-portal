type BrandProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function Brand({ compact = false, inverse = false }: BrandProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl shadow-sm ${
          inverse ? 'bg-white/12 ring-1 ring-white/20' : 'bg-brand-700'
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className="size-6 text-white" fill="none">
          <path
            d="M9 9.5h9.5a4.5 4.5 0 0 1 0 9H14a4.5 4.5 0 0 0 0 9h9"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <circle cx="8" cy="9.5" r="3" fill="currentColor" />
          <circle cx="24" cy="27.5" r="3" fill="currentColor" />
          <circle cx="18.5" cy="18.5" r="2.5" fill="currentColor" opacity=".72" />
        </svg>
      </span>
      {!compact && (
        <span className="min-w-0">
          <span
            className={`block text-base font-bold leading-tight tracking-tight ${
              inverse ? 'text-white' : 'text-ink-950'
            }`}
          >
            ISD Portal
          </span>
          <span
            className={`block text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${
              inverse ? 'text-brand-100' : 'text-slate-500'
            }`}
          >
            IT Service Desk
          </span>
        </span>
      )}
    </div>
  );
}
