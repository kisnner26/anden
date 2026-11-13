import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  EstadoPago,
  RegistroPago,
  RegistroPagos,
  ServicioPagos,
} from '../pagos';

interface FilaPago {
  boleto_id: string;
  estado: EstadoPago;
  marcado_en: string | null;
  marcado_por: string | null;
}

function aRegistro(filas: readonly FilaPago[]): RegistroPagos {
  const registro: Record<string, RegistroPago> = {};
  for (const fila of filas) {
    registro[fila.boleto_id] = {
      estado: fila.estado,
      marcadoEn: fila.marcado_en ?? undefined,
      marcadoPor: fila.marcado_por ?? undefined,
    };
  }
  return registro;
}

/** los pagos en efectivo en la tabla `pagos`; solo los conductores leen y marcan, así que sin permiso la lista queda vacía */
export function crearPagosSupabase(cliente: SupabaseClient): ServicioPagos {
  async function leer(): Promise<RegistroPagos> {
    const { data, error } = await cliente
      .from('pagos')
      .select('boleto_id, estado, marcado_en, marcado_por');
    return error || !data ? {} : aRegistro(data as FilaPago[]);
  }

  return {
    leer,
    async marcarPagado(boletoId, choferId, ahora = new Date()) {
      await cliente.from('pagos').upsert(
        {
          boleto_id: boletoId,
          estado: 'pagado_efectivo',
          marcado_en: ahora.toISOString(),
          marcado_por: choferId,
        },
        { onConflict: 'boleto_id' },
      );
      return leer();
    },
    async revertir(boletoId) {
      await cliente.from('pagos').delete().eq('boleto_id', boletoId);
      return leer();
    },
  };
}
