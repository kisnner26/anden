import { createContext, useContext } from 'react';

export interface ValorEstadoRemotoBoletos {
  abordados: ReadonlySet<string>;
  pagados: ReadonlySet<string>;
}

export const ContextoEstadoRemotoBoletos =
  createContext<ValorEstadoRemotoBoletos>({
    abordados: new Set(),
    pagados: new Set(),
  });

/** lo que el conductor marcó de los boletos de esta persona: quién abordó y quién pagó */
export function useEstadoRemotoBoletos(): ValorEstadoRemotoBoletos {
  return useContext(ContextoEstadoRemotoBoletos);
}
