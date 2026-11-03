import { createContext, useContext } from 'react';

import { PERFIL_VACIO, type PasajeroGuardado, type Perfil } from './perfil';

export interface ValorPerfil {
  agregarPasajero: (pasajero: Omit<PasajeroGuardado, 'id'>) => Promise<void>;
  cargando: boolean;
  /** guarda los cambios del perfil en el teléfono */
  guardar: (cambios: Partial<Omit<Perfil, 'pasajeros'>>) => Promise<void>;
  perfil: Perfil;
  quitarPasajero: (id: string) => Promise<void>;
}

export const ContextoPerfil = createContext<ValorPerfil>({
  agregarPasajero: async () => undefined,
  cargando: false,
  guardar: async () => undefined,
  perfil: PERFIL_VACIO,
  quitarPasajero: async () => undefined,
});

export function usePerfil(): ValorPerfil {
  return useContext(ContextoPerfil);
}
