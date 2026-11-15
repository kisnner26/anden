import { viajesHechos } from './pasaporte';
import type { BoletoGuardado } from './reserva';
import { resumenDeViajes } from './resumenViajes';

export interface ResumenAnual {
  anio: number;
  /** ciudades distintas a las que se llegó */
  ciudades: string[];
  /** el asiento en que más se viajó; nulo sin viajes */
  asientoFavorito: number | null;
  destinoFavorito: string | null;
  /** de 0 a 6, domingo a sábado; nulo sin viajes */
  diaFavorito: number | null;
  gastado: number;
  /** la hora de salida más repetida, de 0 a 23; nulo sin viajes */
  horaFavorita: number | null;
  kilometros: number;
  /** de 0 a 11; nulo sin viajes */
  mesTop: number | null;
  viajes: number;
}

function masRepetido<T>(valores: readonly T[]): T | null {
  const cuenta = new Map<T, number>();
  for (const v of valores) cuenta.set(v, (cuenta.get(v) ?? 0) + 1);
  // a igual cuenta gana el que apareció primero
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

/** lo que se cuenta de un año de viajes: solo los hechos de ese año, con el mismo criterio del pasaporte */
export function resumenAnual(
  boletos: readonly BoletoGuardado[],
  anio: number,
  ahora: Date,
): ResumenAnual {
  const del = viajesHechos(boletos, ahora).filter(
    (b) => new Date(b.resumen.salida).getFullYear() === anio,
  );
  const base = resumenDeViajes(del);
  const fechas = del.map((b) => new Date(b.resumen.salida));
  return {
    anio,
    asientoFavorito: masRepetido(del.map((b) => b.boleto.asiento)),
    ciudades: [...new Set(del.map((b) => b.resumen.destino))],
    destinoFavorito: base.destinoFavorito,
    diaFavorito: masRepetido(fechas.map((f) => f.getDay())),
    gastado: base.gastado,
    horaFavorita: masRepetido(fechas.map((f) => f.getHours())),
    kilometros: base.kilometros,
    mesTop: base.mesTop,
    viajes: base.viajes,
  };
}
