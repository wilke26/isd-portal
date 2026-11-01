import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

const routeTitles = [
  { path: '/', title: 'Meine Tickets' },
  { path: '/login', title: 'Anmelden' },
  { path: '/tickets/new', title: 'Neues Ticket' },
  { path: '/tickets/:id', title: 'Ticketdetails' },
  { path: '/tickets', title: 'Meine Tickets' },
  { path: '/kb', title: 'Wissensdatenbank' },
  { path: '/assets', title: 'Meine Assets' },
];

function titleForPath(pathname: string) {
  return routeTitles.find(({ path }) => matchPath({ path, end: true }, pathname))?.title
    ?? 'Seite nicht gefunden';
}

export function RouteMetadata() {
  const { pathname } = useLocation();
  const title = titleForPath(pathname);

  useEffect(() => {
    document.title = `${title} · ISD Portal`;
  }, [title]);

  return (
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {title} geladen
    </p>
  );
}
