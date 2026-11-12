import { createContext, useContext } from 'react';

import type { MinutosAntes, RecordatorioSalida } from './recordatorios';
import type { Salida } from './salidas';

export type ResultadoRecordatorio =
  'fallo' | 'listo' | 'permiso-negado' | 'ya-paso';

export interface ValorRecordatorios {
  /** el recordatorio pedido para una salida, si hay */
  de: (viajeId: string) => RecordatorioSalida | undefined;
  /** programa el aviso en el teléfono; pide el permiso de notificaciones si hace falta */
  programar: (
    salida: Salida,
    minutosAntes: MinutosAntes,
  ) => Promise<ResultadoRecordatorio>;
  quitar: (viajeId: string) => Promise<void>;
  recordatorios: readonly RecordatorioSalida[];
}

export const ContextoRecordatorios = createContext<ValorRecordatorios>({
  de: () => undefined,
  programar: async () => 'permiso-negado',
  quitar: async () => undefined,
  recordatorios: [],
});

export function useRecordatorios(): ValorRecordatorios {
  return useContext(ContextoRecordatorios);
}
