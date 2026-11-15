import type { Salida } from './salidas';

export interface Llenado {
  /** asientos que faltan para que el bus se llene y salga */
  faltan: number;
  /** de 0 a 1: qué parte del bus ya está vendida */
  proporcion: number;
  /** asientos del bus */
  total: number;
  vendidos: number;
}

/**
 * cuánto le falta a un bus para llenarse. En el interlocal el bus sale cuando se llena, así que ese número es lo que le
 * importa a quien espera; sin el total de asientos no se puede calcular
 */
export function llenadoDe(
  salida: Pick<Salida, 'asientosLibres' | 'asientosTotales'>,
): Llenado | null {
  const total = salida.asientosTotales;
  if (!total || total <= 0) return null;
  const faltan = Math.max(0, Math.min(total, salida.asientosLibres));
  return {
    faltan,
    proporcion: (total - faltan) / total,
    total,
    vendidos: total - faltan,
  };
}
