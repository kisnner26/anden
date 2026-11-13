import { useMemo } from 'react';

import { TERMINAL_POR_CIUDAD, type CorredorInterlocal } from './corredores';
import { inicioDelDia } from './dias';
import {
  minutosParaSalir,
  nivelDisponibilidad,
  proximaHaciaDestino,
  type NivelDisponibilidad,
} from './disponibilidad';
import type { Salida } from './salidas';
import { trazoEntre } from './trazoCorredor';
import { useSalidas } from './useSalidas';

export interface ResumenCorredor {
  /** kilómetros de carretera; nulo si no hay trazo */
  distanciaKm: number | null;
  /** duración estimada del viaje en minutos; nulo si no hay trazo */
  duracionMin: number | null;
  /** cuántos asientos libres tiene la próxima salida */
  libres: number | null;
  minutosParaSalir: number | null;
  nivel: NivelDisponibilidad | null;
  proxima: Salida | null;
}

/** lo que importa de un corredor para decidir: la próxima salida, qué tan llena va y cuánto se estima que dura */
export function useResumenCorredor(
  corredor: CorredorInterlocal,
): ResumenCorredor {
  const hoy = useMemo(() => inicioDelDia(new Date()), []);
  const { ahora, salidas } = useSalidas(
    TERMINAL_POR_CIUDAD[corredor.origen],
    hoy,
  );

  return useMemo(() => {
    const proxima = proximaHaciaDestino(salidas, corredor.destino);
    const trazo = trazoEntre(corredor.origen, corredor.destino);
    return {
      distanciaKm: trazo?.distanciaKm ?? null,
      duracionMin: trazo?.duracionMin ?? null,
      libres: proxima?.asientosLibres ?? null,
      minutosParaSalir: proxima ? minutosParaSalir(proxima, ahora) : null,
      nivel: proxima ? nivelDisponibilidad(proxima.asientosLibres) : null,
      proxima,
    };
  }, [ahora, corredor.destino, corredor.origen, salidas]);
}
