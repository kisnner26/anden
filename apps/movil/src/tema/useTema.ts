import { createContext, useContext } from 'react';

import { coloresClaros, type Colores } from './colores';
import type { ModoAutomatico } from './modoPorHora';

export type PreferenciaTema = 'automatico' | 'claro' | 'oscuro';

export interface ValorTema {
  cargandoTema: boolean;
  colores: Colores;
  establecerPreferencia: (preferencia: PreferenciaTema) => Promise<void>;
  modo: ModoAutomatico;
  preferencia: PreferenciaTema;
}

/** sin proveedor la app se ve en claro, que es el modo base del diseño */
export const ContextoTema = createContext<ValorTema>({
  cargandoTema: false,
  colores: coloresClaros,
  establecerPreferencia: async () => undefined,
  modo: 'claro',
  preferencia: 'claro',
});

export function useTema(): ValorTema {
  return useContext(ContextoTema);
}
