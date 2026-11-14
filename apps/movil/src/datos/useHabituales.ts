import { createContext, useContext } from 'react';

import type { Habitual } from './habituales';

export interface ValorHabituales {
  agregar: (habitual: Habitual) => Promise<void>;
  habituales: readonly Habitual[];
  quitar: (id: string | readonly string[]) => Promise<void>;
}

export const ContextoHabituales = createContext<ValorHabituales>({
  agregar: async () => undefined,
  habituales: [],
  quitar: async () => undefined,
});

export function useHabituales(): ValorHabituales {
  return useContext(ContextoHabituales);
}
