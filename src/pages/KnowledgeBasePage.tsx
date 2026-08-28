import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listArticles } from '../api/kb';
import { LoadingState, ErrorState } from '../components/QueryState';

export function KnowledgeBasePage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['kb-articles', search],
    queryFn: () => listArticles(search),
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Wissensdatenbank</h1>

      <input
        type="search"
        placeholder="Artikel durchsuchen …"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />

      {isLoading && <LoadingState label="Artikel werden geladen …" />}
      {isError && (
        <ErrorState message={error instanceof Error ? error.message : 'Artikel konnten nicht geladen werden.'} />
      )}

      {data && data.data.length === 0 && (
        <p className="text-sm text-slate-500">Keine Artikel gefunden.</p>
      )}

      <ul className="space-y-3">
        {data?.data.map((article) => (
          <li key={article.id} className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">{article.title}</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{article.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
