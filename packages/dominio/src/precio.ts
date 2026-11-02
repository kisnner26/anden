import { error, ok, type Resultado } from './resultado';
import type { Pasajero, Tarifario, TipoServicio, Tramo } from './tipos';

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
