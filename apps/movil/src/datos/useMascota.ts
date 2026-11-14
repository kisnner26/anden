import { createContext, useContext } from 'react';

import type { ConsejosVistos } from './mascota';

export interface ValorMascota {
  activa: boolean;
  cambiar: (activa: boolean) => Promise<void>;
  /** marca un consejo como visto hoy */
  marcar: (id: string) => void;
  vistos: ConsejosVistos;
}

export const ContextoMascota = createContext<ValorMascota>({
  activa: false,
  cambiar: async () => undefined,
  marcar: () => undefined,
  vistos: {},
});

export function useMascota(): ValorMascota {
  return useContext(ContextoMascota);
}
