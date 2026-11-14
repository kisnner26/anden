import type { SupabaseClient } from '@supabase/supabase-js';

import { tokenValido } from '@/datos/viajeCompartido';

import { obtenerCliente } from './cliente';

export interface DatosParaCompartir {
  destino: string;
  /** cuántas horas vale el enlace; el servidor lo limita entre 1 y 48 */
  horas?: number;
  nombre: string;
  origen: string;
  viajeId: string;
}

/** crea el enlace en el servidor y devuelve su código; nulo si no se pudo */
export async function crearCompartidoCon(
  cliente: SupabaseClient,
  datos: DatosParaCompartir,
): Promise<string | null> {
  try {
    const { data, error } = await cliente.rpc('crear_compartido', {
      p_destino: datos.destino,
      p_horas: datos.horas ?? 12,
      p_nombre: datos.nombre,
      p_origen: datos.origen,
      p_viaje_id: datos.viajeId,
    });
    if (error) return null;
    return tokenValido(data) ? data : null;
  } catch {
    return null;
  }
}

export async function crearCompartido(
  datos: DatosParaCompartir,
): Promise<string | null> {
  const cliente = obtenerCliente();
  return cliente ? crearCompartidoCon(cliente, datos) : null;
}
