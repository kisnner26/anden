import type { CierreViaje } from '@/servicios/cierres';

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

/** el viaje que sigue: el primero sin cerrar que sale desde media hora antes de ahora; nulo si ya no hay */
export function proximoViaje(
  viajes: readonly Salida[],
  cerrados: ReadonlySet<string>,
  ahora: Date,
): Salida | null {
  const desde = ahora.getTime() - 30 * 60_000;
  return (
    [...viajes]
      .filter(
        (viaje) =>
          viaje.estado !== 'cancelado' &&
          !cerrados.has(viaje.viajeId) &&
          viaje.salida.getTime() >= desde,
      )
      .sort((a, b) => a.salida.getTime() - b.salida.getTime())[0] ?? null
  );
}

/** lo que el chofer cobró hoy: la suma de los cierres de sus viajes que se cerraron hoy */
export function cobradoDeHoy(
  cierres: readonly Pick<CierreViaje, 'cerradoEn' | 'cobrado'>[],
  ahora: Date,
): number {
  return cierres
    .filter((cierre) => mismoDia(new Date(cierre.cerradoEn), ahora))
    .reduce((suma, cierre) => suma + cierre.cobrado, 0);
}
