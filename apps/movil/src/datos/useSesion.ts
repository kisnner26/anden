import type { Resultado } from '@anden/dominio';
import { createContext, useContext } from 'react';

import type { ErrorSesion, Rol, Sesion } from '@/servicios/sesion';

export interface ValorSesion {
  cargando: boolean;
  cerrar: () => Promise<void>;
  iniciarComoConductor: (
    codigo: string,
    clave: string,
  ) => Promise<Resultado<Sesion, ErrorSesion>>;
  rol: Rol;
  sesion: Sesion | null;
}

export const ContextoSesion = createContext<ValorSesion>({
  cargando: false,
  cerrar: async () => undefined,
  iniciarComoConductor: async () => ({ error: 'credenciales', ok: false }),
  rol: 'pasajero',
  sesion: null,
});

export function useSesion(): ValorSesion {
  return useContext(ContextoSesion);
}
