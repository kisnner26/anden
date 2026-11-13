import { createContext, useContext } from 'react';

import type { Sesion } from '@/servicios/sesion';

import { PERFIL_VACIO, type PasajeroGuardado, type Perfil } from './perfil';

export interface ValorPerfil {
  agregarPasajero: (pasajero: Omit<PasajeroGuardado, 'id'>) => Promise<void>;
  cargando: boolean;
  /** guarda los cambios del perfil en el teléfono */
  /** `cuenta` indica de quién es el perfil cuando la sesión acaba de crearse y la pantalla aún no la ve */
  guardar: (
    cambios: Partial<Omit<Perfil, 'pasajeros'>>,
    cuenta?: Sesion | null,
  ) => Promise<void>;
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
