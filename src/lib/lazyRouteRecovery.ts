const reloadAttemptKey = 'isd_portal_lazy_route_reload_attempted';

export function clearLazyRouteReloadAttempt() {
  try {
    sessionStorage.removeItem(reloadAttemptKey);
  } catch {
    // A successful import needs no recovery when storage is unavailable.
  }
}

function hasReloadAttempt() {
  try {
    return sessionStorage.getItem(reloadAttemptKey) === 'true';
  } catch {
    return true;
  }
}

function markReloadAttempt() {
  try {
    sessionStorage.setItem(reloadAttemptKey, 'true');
    return true;
  } catch {
    return false;
  }
}

export function reloadPortal() {
  window.location.reload();
}

export async function loadLazyRouteModule<T>(
  importer: () => Promise<T>,
  reload: () => void = reloadPortal,
): Promise<T> {
  try {
    const module = await importer();
    clearLazyRouteReloadAttempt();
    return module;
  } catch (error) {
    if (!hasReloadAttempt() && markReloadAttempt()) {
      reload();

      // Keep Suspense active while the browser replaces the current document.
      return await new Promise<T>(() => undefined);
    }

    throw error;
  }
}
