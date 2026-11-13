import { createContext, useContext } from 'react';

import type { EleccionUnidad } from '@/servicios/busPropio';

export interface ValorBusPropio {
  elegir: (variante: EleccionUnidad | null) => Promise<void>;
  /** el bus elegido, sin importar si hay Plus */
  elegido: EleccionUnidad | null;
  /** el bus que se debe dibujar: el elegido solo si hay Plus; si no, nulo y manda el reparto por destino */
  efectivo: EleccionUnidad | null;
}

export const ContextoBusPropio = createContext<ValorBusPropio>({
  efectivo: null,
  elegido: null,
  elegir: async () => undefined,
});

export function useBusPropio(): ValorBusPropio {
  return useContext(ContextoBusPropio);
}
