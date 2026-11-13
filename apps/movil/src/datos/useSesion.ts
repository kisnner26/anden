import type { Resultado } from '@anden/dominio';
import { createContext, useContext } from 'react';

import type {
  DatosRegistro,
  ErrorRegistro,
  ErrorSesion,
  Rol,
  Sesion,
} from '@/servicios/sesion';

export interface ValorSesion {
  cargando: boolean;
  cerrar: () => Promise<void>;
  iniciar: (
    identificador: string,
    clave: string,
  ) => Promise<Resultado<Sesion, ErrorSesion>>;
  registrar: (
    datos: DatosRegistro,
  ) => Promise<Resultado<Sesion, ErrorRegistro>>;
  rol: Rol;
  sesion: Sesion | null;
}

export const ContextoSesion = createContext<ValorSesion>({
  cargando: false,
  cerrar: async () => undefined,
  iniciar: async () => ({ error: 'credenciales', ok: false }),
  registrar: async () => ({ error: 'conexion', ok: false }),
  rol: 'pasajero',
  sesion: null,
});

export function useSesion(): ValorSesion {
  return useContext(ContextoSesion);
}
