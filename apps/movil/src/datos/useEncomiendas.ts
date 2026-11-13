import { createContext, useContext } from 'react';

import type {
  DatosEncomienda,
  Encomienda,
  EstadoEncomienda,
} from './encomiendas';

export interface ValorEncomiendas {
  /** cambia el estado, por ejemplo el chofer que acepta o rechaza con un motivo; falso si no se pudo */
  cambiarEstado: (
    id: string,
    estado: EstadoEncomienda,
    motivo?: string,
  ) => Promise<boolean>;
  cargando: boolean;
  /** envía la solicitud; nulo si el servidor no la recibió */
  enviar: (datos: DatosEncomienda) => Promise<Encomienda | null>;
  /** las de esta persona o, siendo chofer, las de sus viajes; la más nueva primero */
  encomiendas: readonly Encomienda[];
  recargar: () => Promise<void>;
}

export const ContextoEncomiendas = createContext<ValorEncomiendas>({
  cambiarEstado: async () => false,
  cargando: false,
  encomiendas: [],
  enviar: async () => null,
  recargar: async () => undefined,
});

export function useEncomiendas(): ValorEncomiendas {
  return useContext(ContextoEncomiendas);
}
