export function pageFromSearchParams(searchParams: URLSearchParams): number {
  const page = Number(searchParams.get('page'));

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function searchParamsWithPage(searchParams: URLSearchParams, page: number): URLSearchParams {
  const next = new URLSearchParams(searchParams);

  if (page <= 1) {
    next.delete('page');
  } else {
    next.set('page', String(page));
  }

  return next;
}
