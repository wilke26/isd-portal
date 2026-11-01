import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import { UnsavedChangesContext } from './unsaved-changes-context';

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const unsavedChangesRef = useRef(false);

  const hasUnsavedChanges = useCallback(() => unsavedChangesRef.current, []);
  const setUnsavedChanges = useCallback((value: boolean) => {
    unsavedChangesRef.current = value;
  }, []);
  const discardUnsavedChanges = useCallback(() => {
    unsavedChangesRef.current = false;
  }, []);

  const value = useMemo(
    () => ({ hasUnsavedChanges, setUnsavedChanges, discardUnsavedChanges }),
    [discardUnsavedChanges, hasUnsavedChanges, setUnsavedChanges],
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}
