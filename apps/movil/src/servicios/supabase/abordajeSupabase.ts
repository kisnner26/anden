import type { SupabaseClient } from '@supabase/supabase-js';

import type { RegistroAbordaje, ServicioAbordaje } from '../abordaje';

interface FilaAbordaje {
  boleto_id: string;
  marcado_en: string;
}

/** quién ya subió al bus, en la tabla `abordajes`; marcar de nuevo un boleto lo desmarca */
export function crearAbordajeSupabase(
  cliente: SupabaseClient,
  choferDe: () => Promise<string | null>,
): ServicioAbordaje {
  async function leer(): Promise<RegistroAbordaje> {
    const { data, error } = await cliente
      .from('abordajes')
      .select('boleto_id, marcado_en');
    if (error || !data) return {};
    return Object.fromEntries(
      (data as FilaAbordaje[]).map((fila) => [fila.boleto_id, fila.marcado_en]),
    );
  }

  return {
    async alternar(boletoId, ahora = new Date()) {
      const actual = await leer();
      if (actual[boletoId] !== undefined) {
        await cliente.from('abordajes').delete().eq('boleto_id', boletoId);
      } else {
        await cliente.from('abordajes').upsert(
          {
            boleto_id: boletoId,
            marcado_en: ahora.toISOString(),
            marcado_por: await choferDe(),
          },
          { onConflict: 'boleto_id' },
        );
      }
      return leer();
    },
    leer,
  };
}
