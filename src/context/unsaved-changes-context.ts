import { createContext, useContext } from 'react';

export interface UnsavedChangesContextValue {
  hasUnsavedChanges: () => boolean;
  setUnsavedChanges: (value: boolean) => void;
  discardUnsavedChanges: () => void;
}

export const UnsavedChangesContext = createContext<UnsavedChangesContextValue | undefined>(
  undefined,
);

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);

  if (!context) {
    throw new Error('useUnsavedChanges muss innerhalb des UnsavedChangesProvider verwendet werden');
  }

  return context;
}
