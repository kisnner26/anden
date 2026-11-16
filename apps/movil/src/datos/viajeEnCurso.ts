import type { BoletoGuardado } from './reserva';
import type { Salida } from './salidas';

/**
 * el boleto del viaje que el pasajero está haciendo ahora: el chofer ya lo inició (en ruta) y el boleto sigue
 * vigente o ya se usó; si hay varios, el de la salida más reciente. Nulo si no va en ningún viaje
 */
export function boletoEnCurso(
  boletos: readonly BoletoGuardado[],
  salidas: readonly Salida[],
): BoletoGuardado | null {
  const enRuta = new Map(
    salidas
      .filter((salida) => salida.estado === 'en-ruta')
      .map((salida) => [salida.viajeId, salida]),
  );
  const candidatos = boletos
    .filter(
      ({ boleto }) =>
        (boleto.estado === 'vigente' || boleto.estado === 'usado') &&
        enRuta.has(boleto.viajeId),
    )
    .sort(
      (a, b) =>
        new Date(b.resumen.salida).getTime() -
        new Date(a.resumen.salida).getTime(),
    );
  return candidatos[0] ?? null;
}
