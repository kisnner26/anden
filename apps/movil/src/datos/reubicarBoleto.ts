import { estadoAsientos } from '@anden/dominio';

import type { DatosMuestra } from './muestra';
import type { BoletoGuardado, PasajeroReserva } from './reserva';
import type { Salida } from './salidas';

/** cuántas salidas se le ofrecen a quien se quedó sin viaje */
export const MAXIMO_ALTERNATIVAS = 3;

/**
 * las próximas salidas del mismo trayecto a las que se puede pasar un boleto de un viaje cancelado: misma ciudad de
 * origen y de destino, todavía por salir, con la venta abierta y asientos libres; las más cercanas primero
 */
export function alternativasParaBoleto(
  salidas: readonly Salida[],
  guardado: BoletoGuardado,
  ahora: Date,
  maximo: number = MAXIMO_ALTERNATIVAS,
): Salida[] {
  const { destino, origen } = guardado.resumen;
  return salidas
    .filter(
      (salida) =>
        salida.viajeId !== guardado.boleto.viajeId &&
        salida.destino === destino &&
        (origen === undefined || salida.origen === origen) &&
        salida.estado !== 'cancelado' &&
        salida.estado !== 'llego' &&
        salida.ventaAbierta &&
        salida.asientosLibres > 0 &&
        salida.salida.getTime() > ahora.getTime(),
    )
    .sort((a, b) => a.salida.getTime() - b.salida.getTime())
    .slice(0, maximo);
}

/** el primer asiento libre de un viaje, o nulo si no queda ninguno */
export function primerAsientoLibre(
  datos: DatosMuestra,
  viajeId: string,
  ahora: Date,
): number | null {
  const viaje = datos.viajes.find((candidato) => candidato.id === viajeId);
  const bus = datos.buses.find((candidato) => candidato.id === viaje?.busId);
  if (!bus) return null;
  const libre = estadoAsientos(
    bus.configuracion,
    datos.ocupaciones.filter((ocupacion) => ocupacion.viajeId === viajeId),
    ahora,
  ).find((asiento) => asiento.estado === 'libre');
  return libre ? libre.numero : null;
}

/** la misma persona del boleto viejo, con el asiento del nuevo viaje */
export function pasajeroParaReubicar(
  guardado: BoletoGuardado,
  asiento: number,
): PasajeroReserva {
  const { cedula, nombre } = guardado.boleto.pasajero;
  return {
    asiento,
    ...(cedula ? { cedula } : {}),
    nombre,
    ...(guardado.resumen.paraOtro ? { paraOtro: true } : {}),
  };
}
