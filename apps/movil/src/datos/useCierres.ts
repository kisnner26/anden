import { createContext, useContext } from 'react';

import type { CierreViaje } from '@/servicios/cierres';

export interface ValorCierres {
  cerrar: (cierre: CierreViaje) => Promise<void>;
  cierreDe: (viajeId: string) => CierreViaje | undefined;
  cierres: readonly CierreViaje[];
}

export const ContextoCierres = createContext<ValorCierres>({
  cerrar: async () => undefined,
  cierreDe: () => undefined,
  cierres: [],
});

export function useCierres(): ValorCierres {
  return useContext(ContextoCierres);
}
