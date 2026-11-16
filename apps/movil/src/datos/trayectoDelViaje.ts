import { armarDetalle } from './detalle';
import { obtenerMuestra } from './useSalidas';

/** de dónde a dónde va un viaje de la lista; nulo si ya no está en ella */
export function trayectoDelViaje(
  viajeId: string,
  ahora: Date = new Date(),
): { destino: string; origen: string } | undefined {
  const salida = armarDetalle(obtenerMuestra(), viajeId, ahora)?.salida;
  return salida
    ? { destino: salida.destino, origen: salida.origen }
    : undefined;
}
