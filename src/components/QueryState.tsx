export function LoadingState({ label = 'Wird geladen …' }: { label?: string }) {
  return <p className="text-sm text-slate-500">{label}</p>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}
