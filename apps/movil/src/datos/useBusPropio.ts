import { createContext, useContext } from 'react';

import type { IdVarianteBus } from '@/componentes/Autobus';

export interface ValorBusPropio {
  elegir: (variante: IdVarianteBus | null) => Promise<void>;
  /** el bus elegido, sin importar si hay Plus */
  elegido: IdVarianteBus | null;
  /** el bus que se debe dibujar: el elegido solo si hay Plus; si no, nulo y manda el reparto por destino */
  efectivo: IdVarianteBus | null;
}

export const ContextoBusPropio = createContext<ValorBusPropio>({
  efectivo: null,
  elegido: null,
  elegir: async () => undefined,
});

export function useBusPropio(): ValorBusPropio {
  return useContext(ContextoBusPropio);
}
