import { createContext, useContext } from 'react';

import {
  AJUSTES_CONDUCTOR_INICIALES,
  type AjustesConductor,
} from '@/servicios/ajustesConductor';

export interface ValorAjustesConductor {
  ajustes: AjustesConductor;
  cambiar: (cambios: Partial<AjustesConductor>) => Promise<void>;
}

export const ContextoAjustesConductor = createContext<ValorAjustesConductor>({
  ajustes: AJUSTES_CONDUCTOR_INICIALES,
  cambiar: async () => undefined,
});

export function useAjustesConductor(): ValorAjustesConductor {
  return useContext(ContextoAjustesConductor);
}
