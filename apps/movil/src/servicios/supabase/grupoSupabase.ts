import type { SupabaseClient } from '@supabase/supabase-js';

import { obtenerCliente } from './cliente';

export interface MiembroDelGrupo {
  asiento: number;
  /** solo el primer nombre */
  nombre: string;
}

export interface EstadoDelGrupo {
  cupo: number;
  expira_en: string;
  miembros: MiembroDelGrupo[];
  vencido: boolean;
  viaje_id: string;
}

/** crea el grupo de un viaje y devuelve su código; nulo si no se pudo (sin cuenta, sin servidor o el viaje ya salió) */
export async function crearGrupoCon(
  cliente: SupabaseClient,
  viajeId: string,
  cupo: number,
): Promise<string | null> {
  try {
    const { data, error } = await cliente.rpc('crear_grupo', {
      p_cupo: cupo,
      p_viaje: viajeId,
    });
    return error || typeof data !== 'string' ? null : data;
  } catch {
    return null;
  }
}

export async function crearGrupo(
  viajeId: string,
  cupo: number,
): Promise<string | null> {
  const cliente = obtenerCliente();
  return cliente ? crearGrupoCon(cliente, viajeId, cupo) : null;
}

/** el avance del grupo: a qué viaje va, cuántos son y quiénes ya eligieron; nulo si no existe o no respondió */
export async function verGrupoCon(
  cliente: SupabaseClient,
  codigo: string,
): Promise<EstadoDelGrupo | null> {
  try {
    const { data, error } = await cliente.rpc('ver_grupo', {
      p_codigo: codigo,
    });
    if (error || !data || typeof data !== 'object') return null;
    return data as EstadoDelGrupo;
  } catch {
    return null;
  }
}

export async function verGrupo(codigo: string): Promise<EstadoDelGrupo | null> {
  const cliente = obtenerCliente();
  return cliente ? verGrupoCon(cliente, codigo) : null;
}
