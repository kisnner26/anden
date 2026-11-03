import { createContext, useContext } from 'react';

import type { Aviso } from './avisos';
import type { PermisoNotificaciones } from './notificaciones';

export interface ValorAvisos {
  /** pide el permiso si hace falta y activa los recordatorios; devuelve si quedaron activos */
  activar: () => Promise<boolean>;
  activadas: boolean;
  avisos: Aviso[];
  desactivar: () => Promise<void>;
  leidos: readonly string[];
  marcarLeido: (id: string) => Promise<void>;
  marcarTodos: () => Promise<void>;
  noLeidos: number;
  permiso: PermisoNotificaciones;
}

export const ContextoAvisos = createContext<ValorAvisos>({
  activar: async () => false,
  activadas: false,
  avisos: [],
  desactivar: async () => undefined,
  leidos: [],
  marcarLeido: async () => undefined,
  marcarTodos: async () => undefined,
  noLeidos: 0,
  permiso: 'sin-preguntar',
});

export function useAvisos(): ValorAvisos {
  return useContext(ContextoAvisos);
}
