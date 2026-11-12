import { useMemo } from 'react';

import { progresoSobreTrazo, type ProgresoViaje } from './progresoViaje';
import { trazoEntre } from './trazoCorredor';
import { useTransmision, type Transmision } from './useTransmision';

export interface AvanceViaje {
  progreso: ProgresoViaje | null;
  transmision: Transmision;
}

/** si el conductor comparte este viaje, su posición y cuánto lleva recorrido sobre la carretera */
export function useAvanceViaje(
  viajeId: string,
  ciudadOrigen: string,
  ciudadDestino: string,
): AvanceViaje {
  const transmision = useTransmision(viajeId);
  const progreso = useMemo(() => {
    const carretera = trazoEntre(ciudadOrigen, ciudadDestino);
    if (!carretera || !transmision.posicion) return null;
    return progresoSobreTrazo(
      carretera.puntos,
      transmision.posicion,
      carretera.duracionMin,
    );
  }, [ciudadDestino, ciudadOrigen, transmision.posicion]);
  return { progreso, transmision };
}
