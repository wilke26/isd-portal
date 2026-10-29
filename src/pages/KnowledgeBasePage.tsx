import { type FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listArticles } from '../api/kb';
import { LoadingState, ErrorState } from '../components/QueryState';

export function KnowledgeBasePage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['kb-articles', search],
    queryFn: () => listArticles(search),
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
          Hilfe zur Selbsthilfe
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-950">Wissensdatenbank</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Finde verständliche Anleitungen und bewährte Lösungen für häufige IT-Fragen.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        role="search"
        className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <label htmlFor="article-search" className="block text-sm font-bold text-slate-700">
          Artikel durchsuchen
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400"
            >
              ⌕
            </span>
            <input
              id="article-search"
              type="search"
              placeholder="Zum Beispiel VPN, Passwort oder E-Mail"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3.5 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-100"
            />
          </div>
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

      {isLoading && <LoadingState label="Artikel werden geladen …" />}
      {isError && (
        <ErrorState message={error instanceof Error ? error.message : 'Artikel konnten nicht geladen werden.'} />
      )}

      {data && data.data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-full bg-brand-50 text-xl text-brand-700" aria-hidden="true">
            ?
          </div>
          <h2 className="mt-4 text-base font-bold text-ink-950">
            {search ? 'Keine passenden Artikel gefunden' : 'Noch keine Artikel verfügbar'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {search
              ? 'Versuche einen allgemeineren Suchbegriff oder setze die Suche zurück.'
              : 'Veröffentlichte Hilfestellungen erscheinen zukünftig an dieser Stelle.'}
          </p>
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="mt-5 text-sm font-bold text-brand-700 hover:text-brand-900"
            >
              Alle Artikel anzeigen
            </button>
          )}
        </div>
      )}

      {data && data.data.length > 0 && (
        <section aria-labelledby="article-results-heading">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="article-results-heading" className="text-sm font-bold text-ink-950">
              {search ? 'Suchergebnisse' : 'Verfügbare Artikel'}
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              {data.meta.total} Artikel
            </span>
          </div>
          <ul className="grid gap-4 lg:grid-cols-2">
            {data.data.map((article) => (
              <li key={article.id}>
                <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 font-bold text-brand-800">
                      {article.category?.name ?? 'Allgemein'}
                    </span>
                    <span className="text-slate-400">von {article.author.name}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold leading-6 text-ink-950">{article.title}</h3>
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {article.body}
                  </p>

                  {article.tags.length > 0 && (
                    <ul aria-label="Schlagwörter" className="mt-4 flex flex-wrap gap-1.5">
                      {article.tags.map((tag) => (
                        <li key={tag.id} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          {tag.name}
                        </li>
                      ))}
                    </ul>
                  )}

                  <details className="group mt-5 border-t border-slate-100 pt-4">
                    <summary className="cursor-pointer list-none text-sm font-bold text-brand-700 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
                      <span className="group-open:hidden">Artikel vollständig lesen ↓</span>
                      <span className="hidden group-open:inline">Artikel einklappen ↑</span>
                    </summary>
                    <div className="mt-4 border-l-2 border-brand-200 pl-4">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{article.body}</p>
                      {article.addendum && (
                        <aside className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                          <span className="font-bold">Ergänzung:</span> {article.addendum}
                        </aside>
                      )}
                    </div>
                  </details>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
