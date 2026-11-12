import type { Salida } from './salidas';

export type NivelDisponibilidad = 'agotado' | 'hay' | 'pocos';

/** desde cuántos asientos libres se considera que quedan pocos */
export const UMBRAL_POCOS_ASIENTOS = 5;

export function nivelDisponibilidad(
  asientosLibres: number,
): NivelDisponibilidad {
  if (asientosLibres <= 0) return 'agotado';
  return asientosLibres <= UMBRAL_POCOS_ASIENTOS ? 'pocos' : 'hay';
}

/** minutos que faltan para la salida, con el atraso incluido; nunca negativo */
export function minutosParaSalir(salida: Salida, ahora: Date): number {
  const salidaReal = salida.salida.getTime() + salida.minutosAtraso * 60_000;
  return Math.max(0, Math.ceil((salidaReal - ahora.getTime()) / 60_000));
}

/** la salida pendiente más cercana hacia un destino, o null si no queda ninguna */
export function proximaHaciaDestino(
  salidas: readonly Salida[],
  destino: string,
): Salida | null {
  const pendientes = salidas
    .filter(
      (salida) =>
        salida.destino === destino &&
        (salida.estado === 'programado' ||
          salida.estado === 'abordando' ||
          salida.estado === 'atrasado'),
    )
    .sort(
      (a, b) =>
        a.salida.getTime() +
        a.minutosAtraso * 60_000 -
        (b.salida.getTime() + b.minutosAtraso * 60_000),
    );
  return pendientes[0] ?? null;
}
