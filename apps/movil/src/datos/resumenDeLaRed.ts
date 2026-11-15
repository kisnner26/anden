import { mismoDia } from './dias';
import type { Salida } from './salidas';

export interface ResumenDeTramo {
  ciudad: 'Boaco' | 'Juigalpa';
  /** la próxima salida del tramo, en cualquiera de los dos sentidos; nula si no hay */
  proxima: Date | null;
  /** asientos libres en esa próxima salida; nulo si no se sabe */
  libresEnLaProxima: number | null;
  /** cuántas salidas más quedan hoy en el tramo, en los dos sentidos */
  salidasHoy: number;
}

/**
 * la red de un vistazo: por cada tramo entre Managua y una ciudad, cuándo sale el próximo bus (en cualquier sentido), cuántos
 * asientos le quedan y cuántas salidas faltan hoy. Solo cuenta lo que todavía no parte y no está cancelado
 */
export function resumenDeLaRed(
  salidas: readonly Salida[],
  ahora: Date,
): ResumenDeTramo[] {
  return (['Boaco', 'Juigalpa'] as const).map((ciudad) => {
    const pendientes = salidas
      .filter(
        (s) =>
          s.estado !== 'cancelado' &&
          s.salida.getTime() >= ahora.getTime() - 5 * 60_000 &&
          ((s.origen === 'Managua' && s.destino === ciudad) ||
            (s.origen === ciudad && s.destino === 'Managua')),
      )
      .sort((a, b) => a.salida.getTime() - b.salida.getTime());
    const proxima = pendientes[0];
    return {
      ciudad,
      libresEnLaProxima: proxima ? proxima.asientosLibres : null,
      proxima: proxima ? proxima.salida : null,
      salidasHoy: pendientes.filter((s) => mismoDia(s.salida, ahora)).length,
    };
  });
}
