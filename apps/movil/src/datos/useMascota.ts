import { createContext, useContext } from 'react';

export interface ValorMascota {
  activa: boolean;
  establecerActiva: (activa: boolean) => Promise<void>;
}

export const ContextoMascota = createContext<ValorMascota>({
  activa: true,
  establecerActiva: async () => undefined,
});

export function useMascota(): ValorMascota {
  return useContext(ContextoMascota);
}
