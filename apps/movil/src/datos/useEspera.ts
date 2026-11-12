import { createContext, useContext } from 'react';

import type { Espera } from './espera';
import type { Salida } from './salidas';

export interface ValorEspera {
  agregar: (salida: Salida) => Promise<void>;
  enEspera: (viajeId: string) => boolean;
  esperas: readonly Espera[];
  quitar: (viajeId: string) => Promise<void>;
}

export const ContextoEspera = createContext<ValorEspera>({
  agregar: async () => undefined,
  enEspera: () => false,
  esperas: [],
  quitar: async () => undefined,
});

export function useEspera(): ValorEspera {
  return useContext(ContextoEspera);
}
