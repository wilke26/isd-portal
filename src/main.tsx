import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { appRoutes } from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { UnsavedChangesProvider } from './context/UnsavedChangesProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});
const router = createBrowserRouter(appRoutes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UnsavedChangesProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </UnsavedChangesProvider>
    </QueryClientProvider>
  </StrictMode>,
);
