import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { LazyRouteErrorBoundary } from '../components/LazyRouteErrorBoundary';
import { loadLazyRouteModule } from './lazyRouteRecovery';

describe('lazy route recovery', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('reloads once when a route chunk cannot be imported', async () => {
    const reload = vi.fn();

    void loadLazyRouteModule(() => Promise.reject(new Error('missing chunk')), reload);

    await waitFor(() => expect(reload).toHaveBeenCalledOnce());
    expect(sessionStorage.getItem('isd_portal_lazy_route_reload_attempted')).toBe('true');
  });

  test('surfaces a repeated import failure instead of reloading forever', async () => {
    const reload = vi.fn();
    sessionStorage.setItem('isd_portal_lazy_route_reload_attempted', 'true');

    await expect(
      loadLazyRouteModule(() => Promise.reject(new Error('still missing')), reload),
    ).rejects.toThrow('still missing');
    expect(reload).not.toHaveBeenCalled();
  });

  test('offers a manual reload after the automatic recovery failed', async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sessionStorage.setItem('isd_portal_lazy_route_reload_attempted', 'true');

    function BrokenRoute(): null {
      throw new Error('route failed');
    }

    render(
      <LazyRouteErrorBoundary reload={reload}>
        <BrokenRoute />
      </LazyRouteErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Seite konnte nicht geladen werden');
    await user.click(screen.getByRole('button', { name: 'Portal neu laden' }));

    expect(sessionStorage.getItem('isd_portal_lazy_route_reload_attempted')).toBeNull();
    expect(reload).toHaveBeenCalledOnce();
  });
});
