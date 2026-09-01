import { beforeEach, describe, expect, test } from 'vitest';
import { tokenStorage } from './tokenStorage';

const tokenKey = 'isd_portal_token';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('stores tokens only for the current browser tab', () => {
    tokenStorage.set('tab-token');

    expect(sessionStorage.getItem(tokenKey)).toBe('tab-token');
    expect(localStorage.getItem(tokenKey)).toBeNull();
    expect(tokenStorage.get()).toBe('tab-token');
  });

  test('discards a persistent token left by an older portal version', () => {
    localStorage.setItem(tokenKey, 'legacy-token');

    expect(tokenStorage.get()).toBeNull();
    expect(localStorage.getItem(tokenKey)).toBeNull();
    expect(sessionStorage.getItem(tokenKey)).toBeNull();
  });

  test('clears both the current and legacy storage locations', () => {
    sessionStorage.setItem(tokenKey, 'tab-token');
    localStorage.setItem(tokenKey, 'legacy-token');

    tokenStorage.clear();

    expect(sessionStorage.getItem(tokenKey)).toBeNull();
    expect(localStorage.getItem(tokenKey)).toBeNull();
  });
});
