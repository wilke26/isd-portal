import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { appRoutes } from '../App';
import { AuthProvider } from '../context/AuthContext';
import { UnsavedChangesProvider } from '../context/UnsavedChangesProvider';

export function renderApp(initialEntries: string[] = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(appRoutes, { initialEntries });

  return render(
    <QueryClientProvider client={queryClient}>
      <UnsavedChangesProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </UnsavedChangesProvider>
    </QueryClientProvider>,
  );
}
