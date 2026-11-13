import { useMemo } from 'react';

import { TERMINAL_POR_CIUDAD, type CorredorInterlocal } from './corredores';
import { inicioDelDia } from './dias';
import { salidasPendientesHacia } from './planificador';
import type { Salida } from './salidas';
import { trazoEntre } from './trazoCorredor';
import { useSalidas } from './useSalidas';

export interface Planificador {
  ahora: Date;
  distanciaKm: number | null;
  duracionMin: number | null;
  /** las salidas por venir: las de hoy y, si hoy ya no quedan, las de mañana */
  salidas: Salida[];
  /** true cuando las salidas son de mañana porque hoy ya no queda ninguna */
  deManana: boolean;
}

const UN_DIA = 86_400_000;

/** lo necesario para planear un viaje por un corredor: salidas por venir, distancia y duración estimada */
export function usePlanificador(corredor: CorredorInterlocal): Planificador {
  const hoy = useMemo(() => inicioDelDia(new Date()), []);
  const manana = useMemo(() => new Date(hoy.getTime() + UN_DIA), [hoy]);
  const origenId = TERMINAL_POR_CIUDAD[corredor.origen];
  const delDia = useSalidas(origenId, hoy);
  const delSiguiente = useSalidas(origenId, manana);

  return useMemo(() => {
    const deHoy = salidasPendientesHacia(delDia.salidas, corredor.destino);
    const deManana = deHoy.length === 0;
    const salidas = deManana
      ? salidasPendientesHacia(delSiguiente.salidas, corredor.destino)
      : deHoy;
    const trazo = trazoEntre(corredor.origen, corredor.destino);
    return {
      ahora: delDia.ahora,
      deManana,
      distanciaKm: trazo?.distanciaKm ?? null,
      duracionMin: trazo?.duracionMin ?? null,
      salidas,
    };
  }, [corredor.destino, corredor.origen, delDia, delSiguiente]);
}
