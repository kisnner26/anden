import { llegadaEstimada } from './planificador';
import type { ProgresoViaje } from './progresoViaje';
import type { Salida } from './salidas';

export interface EtaViaje {
  kmRestantes: number | null;
  llegada: Date;
  minutosRestantes: number;
  /** de dónde sale la hora: lo que va recorriendo el bus o solo lo previsto desde la salida */
  fuente: 'bus' | 'prevista';
}

/**
 * a qué hora llega el viaje en curso: si el bus transmite, se calcula con lo que le falta de camino;
 * si no, con la salida y la duración prevista. Siempre es una estimación, nunca una promesa
 */
export function etaDelViaje(
  ahora: Date,
  salida: Salida,
  duracionMin: number,
  progreso: ProgresoViaje | null,
): EtaViaje {
  if (progreso) {
    return {
      fuente: 'bus',
      kmRestantes: progreso.kmRestantes,
      llegada: new Date(ahora.getTime() + progreso.minutosRestantes * 60_000),
      minutosRestantes: progreso.minutosRestantes,
    };
  }
  const llegada = llegadaEstimada(salida, duracionMin);
  return {
    fuente: 'prevista',
    kmRestantes: null,
    llegada,
    minutosRestantes: Math.max(
      0,
      Math.round((llegada.getTime() - ahora.getTime()) / 60_000),
    ),
  };
}
