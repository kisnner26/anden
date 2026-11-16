import type { Salida } from './salidas';

/** cuántos pasajeros tiene reservados un viaje; 0 si no se sabe cuántos asientos tiene el bus */
export function pasajerosReservados(
  viaje: Pick<Salida, 'asientosLibres' | 'asientosTotales'>,
): number {
  if (viaje.asientosTotales === undefined) return 0;
  return Math.max(0, viaje.asientosTotales - viaje.asientosLibres);
}
