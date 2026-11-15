import type { SupabaseClient } from '@supabase/supabase-js';

import { obtenerCliente } from './cliente';

export interface EstadoRemotoDeBoletos {
  /** boletos que el conductor ya marcó como a bordo */
  abordados: string[];
  /** boletos que el conductor ya marcó como cobrados en efectivo */
  pagados: string[];
}

/**
 * lo que el conductor fue marcando de los boletos de esta persona: quiénes ya subieron y quiénes ya pagaron; nulo si no hay
 * servidor o no respondió. Quien no tiene permiso para leer una de las dos tablas recibe esa lista vacía
 */
export async function leerEstadoDeBoletosCon(
  cliente: SupabaseClient,
  ids: readonly string[],
): Promise<EstadoRemotoDeBoletos | null> {
  if (ids.length === 0) return { abordados: [], pagados: [] };
  try {
    const [abordajes, pagos] = await Promise.all([
      cliente
        .from('abordajes')
        .select('boleto_id')
        .in('boleto_id', [...ids]),
      cliente
        .from('pagos')
        .select('boleto_id, estado')
        .in('boleto_id', [...ids]),
    ]);
    if (abordajes.error && pagos.error) return null;
    return {
      abordados: ((abordajes.data ?? []) as { boleto_id: string }[]).map(
        (f) => f.boleto_id,
      ),
      pagados: ((pagos.data ?? []) as { boleto_id: string; estado: string }[])
        .filter((f) => f.estado === 'pagado_efectivo')
        .map((f) => f.boleto_id),
    };
  } catch {
    return null;
  }
}

export async function leerEstadoDeBoletos(
  ids: readonly string[],
): Promise<EstadoRemotoDeBoletos | null> {
  const cliente = obtenerCliente();
  return cliente ? leerEstadoDeBoletosCon(cliente, ids) : null;
}
