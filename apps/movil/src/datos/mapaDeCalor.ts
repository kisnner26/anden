import { mismoDia } from './dias';
import type { Salida } from './salidas';

export const FRANJAS = ['madrugada', 'manana', 'tarde', 'noche'] as const;
export type Franja = (typeof FRANJAS)[number];

/** las horas de salida que cubre cada franja, de la inicial (incluida) a la final (excluida) */
const RANGOS: Record<Franja, [number, number]> = {
  madrugada: [0, 7],
  manana: [7, 12],
  noche: [18, 24],
  tarde: [12, 18],
};

export interface Celda {
  dia: Date;
  franja: Franja;
  /** asientos libres en total; nulo si algún bus no dice cuántos tiene */
  libres: number | null;
  /** de 0 a 1: qué tan fácil es conseguir lugar; nulo si no hay salidas en esa franja */
  holgura: number | null;
  salidas: number;
}

export function franjaDe(fecha: Date): Franja {
  const h = fecha.getHours();
  return FRANJAS.find((f) => h >= RANGOS[f][0] && h < RANGOS[f][1]) ?? 'noche';
}

/**
 * la semana en una cuadrícula de días por franjas del día: cuántas salidas hay y qué tan fácil es conseguir lugar. Sin
 * salidas la celda queda vacía; con ellas, la holgura es la proporción de asientos libres sobre los que tienen los buses
 */
export function mapaDeCalor(
  salidas: readonly Salida[],
  dias: readonly Date[],
  ahora: Date,
): Celda[] {
  const celdas: Celda[] = [];
  for (const dia of dias) {
    for (const franja of FRANJAS) {
      const delas = salidas.filter(
        (s) =>
          mismoDia(s.salida, dia) &&
          franjaDe(s.salida) === franja &&
          s.estado !== 'cancelado' &&
          s.salida.getTime() >= ahora.getTime() - 5 * 60_000,
      );
      if (delas.length === 0) {
        celdas.push({ dia, franja, holgura: null, libres: null, salidas: 0 });
        continue;
      }
      const conTotal = delas.every((s) => s.asientosTotales);
      const libres = delas.reduce((suma, s) => suma + s.asientosLibres, 0);
      const total = delas.reduce(
        (suma, s) => suma + (s.asientosTotales ?? 0),
        0,
      );
      celdas.push({
        dia,
        franja,
        holgura: conTotal && total > 0 ? Math.min(1, libres / total) : null,
        libres: conTotal ? libres : null,
        salidas: delas.length,
      });
    }
  }
  return celdas;
}
