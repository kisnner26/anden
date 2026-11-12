import { useMemo } from 'react';

import {
  interpolar,
  minutosRestantes,
  progresoSimulado,
  puntoSobreTrazo,
  type Punto,
} from './busSimulado';
import { trazoEntre } from './trazoCorredor';
import { obtenerMuestra, useAhora } from './useSalidas';

const DOS_SEGUNDOS = 2000;

export interface ExtremoCorredor {
  codigo: string;
  coordenadas: Punto;
  nombre: string;
}

export interface BusSimulado {
  bus: Punto;
  destino: ExtremoCorredor;
  /** kilómetros de carretera; nulo si solo tenemos la línea recta */
  distanciaKm: number | null;
  duracionMin: number;
  origen: ExtremoCorredor;
  porcentaje: number;
  restantes: number;
  /** el camino que sigue el bus, de la terminal de origen a la de destino */
  trazo: Punto[];
}

/** un bus simulado entre dos ciudades de la muestra; se mueve cada dos segundos. Nulo si no hay ruta */
export function useBusSimulado(
  ciudadOrigen: string,
  ciudadDestino: string,
): BusSimulado | null {
  const ahora = useAhora(DOS_SEGUNDOS);
  const datos = obtenerMuestra();

  return useMemo(() => {
    const origen = datos.terminales.find((x) => x.ciudad === ciudadOrigen);
    const destino = datos.terminales.find((x) => x.ciudad === ciudadDestino);
    if (!origen || !destino) return null;
    const ruta = datos.rutas.find(
      (x) => x.origenId === origen.id && x.destinoId === destino.id,
    );
    if (!ruta) return null;
    const carretera = trazoEntre(ciudadOrigen, ciudadDestino);
    const duracionMin = carretera?.duracionMin ?? ruta.duracionMin;
    const trazo = carretera?.puntos ?? [
      origen.coordenadas,
      destino.coordenadas,
    ];
    const progreso = progresoSimulado(ahora, duracionMin);
    return {
      bus: carretera
        ? puntoSobreTrazo(trazo, progreso)
        : interpolar(origen.coordenadas, destino.coordenadas, progreso),
      destino: {
        codigo: destino.codigo,
        coordenadas: destino.coordenadas,
        nombre: destino.nombre,
      },
      distanciaKm: carretera?.distanciaKm ?? null,
      duracionMin,
      origen: {
        codigo: origen.codigo,
        coordenadas: origen.coordenadas,
        nombre: origen.nombre,
      },
      porcentaje: Math.round(progreso * 100),
      restantes: minutosRestantes(progreso, duracionMin),
      trazo,
    };
  }, [ahora, ciudadDestino, ciudadOrigen, datos]);
}
