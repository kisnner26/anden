import { mismoDia } from './dias';
import type { Salida } from './salidas';
import { trazoEntre } from './trazoCorredor';

export type EstadoDelBloque = 'cerrado' | 'enVivo' | 'pendiente';

export interface BloqueDelDia {
  destino: string;
  estado: EstadoDelBloque;
  /** dónde termina, de 0 a 1 sobre las horas que muestra el eje */
  fin: number;
  /** dónde empieza, de 0 a 1 */
  inicio: number;
  /** el bus no puede estar en dos viajes a la vez: este bloque choca con otro de la misma unidad */
  solapa: boolean;
  viajeId: string;
}

/** las horas que muestra el eje del día: de las 5 de la mañana a las 11 de la noche */
export const HORA_INICIAL = 5;
export const HORA_FINAL = 23;

/** cuánto dura un viaje: lo que dice el trazo de la ruta, o dos horas si no se conoce */
function duracionDe(salida: Salida): number {
  return trazoEntre(salida.origen, salida.destino)?.duracionMin ?? 120;
}

/**
 * el día del chofer como bloques sobre un eje de horas: dónde empieza y termina cada viaje, si ya cerró, va en vivo o
 * está por salir, y si choca con otro de la misma unidad. Solo entran los viajes de ese día
 */
export function bloquesDelDia(
  viajes: readonly Salida[],
  dia: Date,
  enVivo: (viajeId: string) => boolean,
  cerrado: (viajeId: string) => boolean,
): BloqueDelDia[] {
  const ancho = HORA_FINAL - HORA_INICIAL;
  const aEje = (fecha: Date) =>
    Math.min(
      1,
      Math.max(
        0,
        (fecha.getHours() + fecha.getMinutes() / 60 - HORA_INICIAL) / ancho,
      ),
    );
  const delDia = viajes
    .filter((v) => mismoDia(v.salida, dia))
    .map((v) => ({
      fin: new Date(v.salida.getTime() + duracionDe(v) * 60_000),
      salida: v,
    }));
  return delDia.map(({ fin, salida }) => {
    const solapa = delDia.some(
      (otro) =>
        otro.salida.viajeId !== salida.viajeId &&
        otro.salida.placa === salida.placa &&
        otro.salida.salida.getTime() < fin.getTime() &&
        otro.fin.getTime() > salida.salida.getTime(),
    );
    return {
      destino: salida.destino,
      estado: cerrado(salida.viajeId)
        ? 'cerrado'
        : enVivo(salida.viajeId)
          ? 'enVivo'
          : 'pendiente',
      fin: aEje(fin),
      inicio: aEje(salida.salida),
      solapa,
      viajeId: salida.viajeId,
    };
  });
}
