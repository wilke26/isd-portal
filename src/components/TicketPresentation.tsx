import type { TicketPriorityValue, TicketStatusValue } from '../types';

const statusClasses: Record<TicketStatusValue, string> = {
  open: 'border-blue-200 bg-blue-50 text-blue-700',
  in_progress: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  waiting_for_requester: 'border-amber-200 bg-amber-50 text-amber-800',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  closed: 'border-slate-200 bg-slate-100 text-slate-600',
};

const priorityClasses: Record<TicketPriorityValue, string> = {
  low: 'text-slate-500',
  medium: 'text-blue-700',
  high: 'text-amber-700',
  critical: 'text-red-700',
};

export function TicketStatusBadge({
  value,
  label,
}: {
  value: TicketStatusValue;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses[value]}`}
    >
      {label}
    </span>
  );
}

export function TicketPriority({
  value,
  label,
}: {
  value: TicketPriorityValue;
  label: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${priorityClasses[value]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      Priorität {label}
    </span>
  );
}

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function FormattedDate({ value }: { value: string }) {
  return <time dateTime={value}>{dateFormatter.format(new Date(value))}</time>;
}
