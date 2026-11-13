import type { SupabaseClient } from '@supabase/supabase-js';

import type { Encomienda } from '@/datos/encomiendas';

import type { ServicioEncomiendas } from '../servicioEncomiendas';

interface FilaEncomienda {
  chofer_id: string | null;
  contenido: Encomienda;
  estado: Encomienda['estado'];
  id: string;
  motivo: string | null;
  viaje_id: string | null;
}

function aFila(encomienda: Encomienda) {
  return {
    actualizada_en: new Date().toISOString(),
    chofer_id: encomienda.choferId ?? null,
    contenido: encomienda,
    estado: encomienda.estado,
    id: encomienda.id,
    motivo: encomienda.motivoRechazo ?? null,
    viaje_id: encomienda.viajeId ?? null,
  };
}

/** las encomiendas en la tabla `encomiendas`: quien las envía y el chofer del viaje ven la misma fila */
export function crearEncomiendasSupabase(
  cliente: SupabaseClient,
): ServicioEncomiendas {
  return {
    async actualizar(encomienda) {
      try {
        const { error } = await cliente
          .from('encomiendas')
          .update({
            actualizada_en: new Date().toISOString(),
            contenido: encomienda,
            estado: encomienda.estado,
            motivo: encomienda.motivoRechazo ?? null,
          })
          .eq('id', encomienda.id);
        return error === null;
      } catch {
        return false;
      }
    },
    async guardar(encomienda) {
      try {
        const { error } = await cliente
          .from('encomiendas')
          .insert(aFila(encomienda));
        return error === null;
      } catch {
        return false;
      }
    },
    async listar() {
      try {
        const { data, error } = await cliente
          .from('encomiendas')
          .select('id, viaje_id, chofer_id, estado, motivo, contenido')
          .order('creada_en', { ascending: false });
        if (error || !data) return null;
        // el estado y el motivo de la fila mandan sobre lo que traiga el contenido guardado
        return (data as FilaEncomienda[]).map((fila) => ({
          ...fila.contenido,
          estado: fila.estado,
          ...(fila.motivo ? { motivoRechazo: fila.motivo } : {}),
        }));
      } catch {
        return null;
      }
    },
  };
}
