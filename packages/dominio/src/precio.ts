import { error, ok, type Resultado } from './resultado';
import type {
  Pasajero,
  Ruta,
  Tarifario,
  TipoServicio,
  Tramo,
} from './tipos';

export const MULTIPLICADORES_BUS: Record<TipoServicio, number> = {
  ordinario: 1,
  'taxi-interlocal': 1.2,
  expreso: 1.5,
};

function esTramoValido(ruta: Ruta, tramo: Tramo): boolean {
  return (
    Number.isInteger(tramo.desde) &&
    Number.isInteger(tramo.hasta) &&
    tramo.desde >= 0 &&
    tramo.desde < tramo.hasta &&
    tramo.hasta < ruta.paradas.length
  );
}

/** minutos que tarda el bus entre las dos paradas del tramo */
export function minutosDelTramo(ruta: Ruta, tramo: Tramo): number | null {
  if (!esTramoValido(ruta, tramo)) return null;

  const salida = ruta.paradas[tramo.desde];
  const llegada = ruta.paradas[tramo.hasta];
  if (!salida || !llegada) return null;
  return llegada.minutosDesdeOrigen - salida.minutosDesdeOrigen;
}

/** tarifa de una persona que paga, redondeada una sola vez al córdoba entero */
export function precioUnitario(
  ruta: Ruta,
  tramo: Tramo,
  tipoBus: TipoServicio,
): number | null {
  const minutos = minutosDelTramo(ruta, tramo);
  if (minutos === null || minutos <= 0) return null;

  if (tramo.desde === 0 && tramo.hasta === ruta.paradas.length - 1) {
    return Math.ceil(ruta.tarifaBase * MULTIPLICADORES_BUS[tipoBus]);
  }

  return Math.ceil(
    (ruta.tarifaBase * minutos * MULTIPLICADORES_BUS[tipoBus]) /
      ruta.duracionMin,
  );
}

export function calcularPrecio(
  ruta: Ruta,
  tramo: Tramo,
  tipoBus: TipoServicio,
  pasajeros: Pasajero[],
): Resultado<
  { unitario: number; total: number },
  'tramo-invalido' | 'sin-pasajeros'
> {
  const unitario = precioUnitario(ruta, tramo, tipoBus);
  if (unitario === null) return error('tramo-invalido');

  const cantidad = pasajeros.filter(
    (pasajero) => !pasajero.esMenorEnBrazos,
  ).length;
  if (cantidad === 0) return error('sin-pasajeros');

  return ok({ unitario, total: unitario * cantidad });
}

export function precioOficial(
  tarifario: Tarifario,
  rutaId: string,
  servicio: TipoServicio,
  tramo: Tramo,
  pasajeros: Pasajero[],
): Resultado<
  { unitario: number; total: number },
  'sin-tarifa-autorizada' | 'tramo-invalido' | 'sin-pasajeros'
> {
  if (
    !Number.isInteger(tramo.desde) ||
    !Number.isInteger(tramo.hasta) ||
    tramo.desde < 0 ||
    tramo.desde >= tramo.hasta
  ) {
    return error('tramo-invalido');
  }
  const tarifa = tarifario.find(
    (candidata) =>
      candidata.rutaId === rutaId &&
      candidata.servicio === servicio &&
      candidata.desdeParada === tramo.desde &&
      candidata.hastaParada === tramo.hasta,
  );
  if (!tarifa) return error('sin-tarifa-autorizada');
  const cantidad = pasajeros.filter(
    (pasajero) => !pasajero.esMenorEnBrazos,
  ).length;
  if (cantidad === 0) return error('sin-pasajeros');
  return ok({ unitario: tarifa.cordobas, total: tarifa.cordobas * cantidad });
}
