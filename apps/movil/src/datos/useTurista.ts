import { createContext, useContext } from 'react';

export interface ValorTurista {
  cambiar: (turista: boolean) => Promise<void>;
  turista: boolean;
}

export const ContextoTurista = createContext<ValorTurista>({
  cambiar: async () => undefined,
  turista: false,
});

export function useTurista(): ValorTurista {
  return useContext(ContextoTurista);
}
