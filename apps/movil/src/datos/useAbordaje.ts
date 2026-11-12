import { createContext, useContext } from 'react';

import { abordo, type RegistroAbordaje } from '@/servicios/abordaje';

export interface ValorAbordaje {
  abordo: (boletoId: string) => boolean;
  alternar: (boletoId: string) => Promise<void>;
  registro: RegistroAbordaje;
}

export const ContextoAbordaje = createContext<ValorAbordaje>({
  abordo: (boletoId) => abordo({}, boletoId),
  alternar: async () => undefined,
  registro: {},
});

export function useAbordaje(): ValorAbordaje {
  return useContext(ContextoAbordaje);
}
