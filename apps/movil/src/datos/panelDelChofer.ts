import { mismoDia } from './dias';
import type { Salida } from './salidas';

/** cuántos pasajeros tiene reservados un viaje; 0 si no se sabe cuántos asientos tiene el bus */
export function pasajerosReservados(
  viaje: Pick<Salida, 'asientosLibres' | 'asientosTotales'>,
): number {
  if (viaje.asientosTotales === undefined) return 0;
  return Math.max(0, viaje.asientosTotales - viaje.asientosLibres);
}

/** los viajes del chofer que salen hoy, sin contar los cancelados, de la hora más temprana a la más tarde */
export function viajesDeHoy(viajes: readonly Salida[], ahora: Date): Salida[] {
  return viajes
    .filter(
      (viaje) => mismoDia(viaje.salida, ahora) && viaje.estado !== 'cancelado',
    )
    .sort((a, b) => a.salida.getTime() - b.salida.getTime());
}
