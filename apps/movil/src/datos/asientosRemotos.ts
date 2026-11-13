import { leerAsientosOcupados } from '@/servicios/supabase/boletosCompartidos';

import { obtenerMuestra } from './useSalidas';

/** el dueño de los asientos que vendió otro teléfono: no se sabe quién es, solo que están tomados */
export const DUENO_REMOTO = 'remoto';

/**
 * trae del servidor los asientos que ya vendió cualquier teléfono y los deja tomados en la
 * muestra de esta sesión, para que el plano y la reserva coincidan con lo que ve el conductor.
 * Devuelve cuántos asientos nuevos quedaron tomados.
 */
export async function sincronizarAsientos(viajeId: string): Promise<number> {
  const asientos = await leerAsientosOcupados(viajeId);
  if (asientos === null) return 0;
  const muestra = obtenerMuestra();
  let nuevos = 0;
  for (const asiento of asientos) {
    const tomado = muestra.ocupaciones.some(
      (ocupacion) =>
        ocupacion.viajeId === viajeId &&
        ocupacion.asiento === asiento &&
        ocupacion.estado === 'vendido',
    );
    if (tomado) continue;
    muestra.ocupaciones.push({
      asiento,
      boletoId: `${DUENO_REMOTO}_${viajeId}_${asiento}`,
      duenoId: DUENO_REMOTO,
      estado: 'vendido',
      viajeId,
    });
    nuevos += 1;
  }
  return nuevos;
}
