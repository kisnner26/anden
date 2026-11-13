import { createContext, useContext } from 'react';

export interface ValorSeguridad {
  /** la detección de choques está encendida */
  activa: boolean;
  cambiar: (activa: boolean) => Promise<void>;
  /** hay un viaje en marcha en el que se vigila */
  vigilando: boolean;
}

export const ContextoSeguridad = createContext<ValorSeguridad>({
  activa: true,
  cambiar: async () => undefined,
  vigilando: false,
});

export function useSeguridad(): ValorSeguridad {
  return useContext(ContextoSeguridad);
}
