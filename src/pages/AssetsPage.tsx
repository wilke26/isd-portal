import { type FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAssets } from '../api/assets';
import { ErrorState, LoadingState } from '../components/QueryState';

function formatDate(value: string | null) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('de-DE').format(new Date(`${value}T00:00:00`));
}

export function AssetsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['assets', search],
    queryFn: () => listAssets(search),
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Meine Assets</h1>
        <p className="mt-1 text-sm text-slate-600">
          Geräte und Inventar, die deinem Benutzerkonto aktuell zugewiesen sind.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex max-w-lg gap-2" role="search">
        <label htmlFor="asset-search" className="sr-only">
          Assets durchsuchen
        </label>
        <input
          id="asset-search"
          type="search"
          placeholder="Name, Asset-Tag oder Seriennummer"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Suchen
        </button>
      </form>

      {isLoading && <LoadingState label="Assets werden geladen …" />}
      {isError && (
        <ErrorState message={error instanceof Error ? error.message : 'Assets konnten nicht geladen werden.'} />
      )}

      {data && data.data.length === 0 && (
        <p className="text-sm text-slate-500">
          {search ? 'Keine passenden Assets gefunden.' : 'Dir sind aktuell keine Assets zugewiesen.'}
        </p>
      )}

      {data && data.data.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Asset</th>
                  <th scope="col" className="px-4 py-3 font-medium">Kategorie</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Seriennummer</th>
                  <th scope="col" className="px-4 py-3 font-medium">Garantie bis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.data.map((asset) => (
                  <tr key={asset.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{asset.name}</div>
                      <div className="mt-0.5 font-mono text-xs text-slate-500">{asset.asset_tag}</div>
                      {(asset.manufacturer || asset.model) && (
                        <div className="mt-1 text-xs text-slate-500">
                          {[asset.manufacturer, asset.model].filter(Boolean).join(' ')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{asset.category?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {asset.status?.name ?? 'Unbekannt'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{asset.serial_number ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(asset.warranty_until)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
            {data.meta.total} {data.meta.total === 1 ? 'Asset' : 'Assets'}
          </div>
        </div>
      )}
    </div>
  );
}
