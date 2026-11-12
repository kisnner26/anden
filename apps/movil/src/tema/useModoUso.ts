import { createContext, useContext } from 'react';

import { ajustesDeModo, type AjustesModoUso, type ModoUso } from './modoUso';

export interface ValorModoUso {
  ajustes: AjustesModoUso;
  establecerModo: (modo: ModoUso) => Promise<void>;
  modo: ModoUso;
}

export const ContextoModoUso = createContext<ValorModoUso>({
  ajustes: ajustesDeModo('completo'),
  establecerModo: async () => undefined,
  modo: 'completo',
});

export function useModoUso(): ValorModoUso {
  return useContext(ContextoModoUso);
}
