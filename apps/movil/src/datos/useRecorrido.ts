import { useMemo } from 'react';

import type { Punto } from './busSimulado';
import { trazoEntre } from './trazoCorredor';
import type { ExtremoCorredor } from './useBusSimulado';
import { obtenerMuestra } from './useSalidas';

export interface Recorrido {
  destino: ExtremoCorredor;
  distanciaKm: number | null;
  origen: ExtremoCorredor;
  trazo: Punto[];
}

/** el camino entre dos ciudades de la muestra, sin bus; nulo si falta una terminal o la ruta */
export function useRecorrido(
  ciudadOrigen: string,
  ciudadDestino: string,
): Recorrido | null {
  return useMemo(() => {
    const datos = obtenerMuestra();
    const origen = datos.terminales.find((x) => x.ciudad === ciudadOrigen);
    const destino = datos.terminales.find((x) => x.ciudad === ciudadDestino);
    if (!origen || !destino) return null;
    const carretera = trazoEntre(ciudadOrigen, ciudadDestino);
    return {
      destino: {
        codigo: destino.codigo,
        coordenadas: destino.coordenadas,
        nombre: destino.nombre,
      },
      distanciaKm: carretera?.distanciaKm ?? null,
      origen: {
        codigo: origen.codigo,
        coordenadas: origen.coordenadas,
        nombre: origen.nombre,
      },
      trazo: carretera?.puntos ?? [origen.coordenadas, destino.coordenadas],
    };
  }, [ciudadDestino, ciudadOrigen]);
}
