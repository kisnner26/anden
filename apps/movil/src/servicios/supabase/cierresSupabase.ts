import type { SupabaseClient } from '@supabase/supabase-js';

import { esCierre, type CierreViaje, type ServicioCierres } from '../cierres';

/** los cierres en la tabla `cierres`; el resumen completo va en `contenido` y las cifras en sus columnas */
export function crearCierresSupabase(cliente: SupabaseClient): ServicioCierres {
  async function leer(): Promise<CierreViaje[]> {
    const { data, error } = await cliente.from('cierres').select('contenido');
    if (error || !data) return [];
    return data
      .map((fila) => (fila as { contenido: unknown }).contenido)
      .filter(esCierre);
  }

  return {
    leer,
    async guardar(cierre) {
      await cliente.from('cierres').upsert(
        {
          chofer_id: cierre.choferId,
          cerrado_en: cierre.cerradoEn,
          cobrado: cierre.cobrado,
          contenido: cierre,
          viaje_id: cierre.viajeId,
        },
        { onConflict: 'viaje_id' },
      );
      return leer();
    },
  };
}
