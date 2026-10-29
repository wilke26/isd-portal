import { type FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAssets } from '../api/assets';
import { ErrorState, LoadingState } from '../components/QueryState';

const dateFormatter = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' });

function formatDate(value: string | null | undefined) {
  if (!value) return 'Nicht hinterlegt';

  const date = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);
  return dateFormatter.format(date);
}

function statusColor(value: string | undefined) {
  return value && /^#[\da-f]{6}$/i.test(value) ? value : '#64748b';
}

export function AssetsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['assets', search],
    queryFn: () => listAssets(search),
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  return (
    <div>
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
          Meine Ausstattung
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-950">Meine Assets</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Geräte und Inventar, die deinem Benutzerkonto aktuell zugewiesen sind.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        role="search"
        className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <label htmlFor="asset-search" className="block text-sm font-bold text-slate-700">
          Assets durchsuchen
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="asset-search"
            type="search"
            placeholder="Name, Asset-Tag oder Seriennummer"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Suchen
          </button>
        </div>
        {search && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Ergebnisse für „{search}“</span>
            <button
              type="button"
              onClick={clearSearch}
              className="font-bold text-brand-700 hover:text-brand-900"
            >
              Suche zurücksetzen
            </button>
          </div>
        )}
      </form>

      {isLoading && <LoadingState label="Assets werden geladen …" />}
      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Assets konnten nicht geladen werden.'}
          onRetry={() => void refetch()}
        />
      )}

      {data && data.data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-full bg-brand-50 text-xl text-brand-700" aria-hidden="true">
            ◇
          </div>
          <h2 className="mt-4 text-base font-bold text-ink-950">
            {search ? 'Keine passenden Assets gefunden' : 'Keine Assets zugewiesen'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {search
              ? 'Prüfe den Suchbegriff oder zeige wieder deine gesamte Ausstattung an.'
              : 'Sobald dir ein Gerät zugeordnet wird, erscheinen seine Details an dieser Stelle.'}
          </p>
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="mt-5 text-sm font-bold text-brand-700 hover:text-brand-900"
            >
              Alle Assets anzeigen
            </button>
          )}
        </div>
      )}

      {data && data.data.length > 0 && (
        <section aria-labelledby="asset-results-heading">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="asset-results-heading" className="text-sm font-bold text-ink-950">
              Zugewiesene Ausstattung
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              {data.meta.total} {data.meta.total === 1 ? 'Asset' : 'Assets'}
            </span>
          </div>

          <ul className="grid gap-5 xl:grid-cols-2">
            {data.data.map((asset) => (
              <li key={asset.id}>
                <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex min-w-0 gap-4">
                      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6">
                          <rect x="3" y="4" width="18" height="13" rx="2" />
                          <path d="M8 21h8M12 17v4" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-ink-950">{asset.name}</h3>
                        <p className="mt-1 font-mono text-xs font-semibold text-slate-500">{asset.asset_tag}</p>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: statusColor(asset.status?.color) }}
                        aria-hidden="true"
                      />
                      {asset.status?.name ?? 'Unbekannt'}
                    </span>
                  </div>

                  <dl className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2">
                    <div className="bg-white px-5 py-4 sm:px-6">
                      <dt className="text-xs font-semibold text-slate-400">Hersteller und Modell</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-700">
                        {[asset.manufacturer, asset.model].filter(Boolean).join(' ') || 'Nicht hinterlegt'}
                      </dd>
                    </div>
                    <div className="bg-white px-5 py-4 sm:px-6">
                      <dt className="text-xs font-semibold text-slate-400">Kategorie</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-700">{asset.category?.name ?? 'Nicht zugeordnet'}</dd>
                    </div>
                    <div className="bg-white px-5 py-4 sm:px-6">
                      <dt className="text-xs font-semibold text-slate-400">Seriennummer</dt>
                      <dd className="mt-1 break-all font-mono text-sm text-slate-700">{asset.serial_number ?? 'Nicht hinterlegt'}</dd>
                    </div>
                    <div className="bg-white px-5 py-4 sm:px-6">
                      <dt className="text-xs font-semibold text-slate-400">Garantie bis</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-700">{formatDate(asset.warranty_until)}</dd>
                    </div>
                  </dl>

                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
                    {asset.current_assignment?.user ? (
                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                        <span className="text-xs font-semibold text-slate-500">
                          Zugewiesen an <strong className="text-slate-700">{asset.current_assignment.user.name}</strong>
                        </span>
                        <span className="text-xs text-slate-500">
                          seit {formatDate(asset.current_assignment.assigned_at)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-500">Keine aktuelle Zuweisung</p>
                    )}
                    {asset.notes && (
                      <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-600">
                        {asset.notes}
                      </p>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
