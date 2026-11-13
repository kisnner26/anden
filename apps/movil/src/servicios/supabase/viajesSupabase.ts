import type { SupabaseClient } from '@supabase/supabase-js';

import { obtenerCliente } from './cliente';

/** un viaje tal como lo publica el conductor */
export interface FilaViaje {
  anden: number;
  chofer_id: string;
  estado: string;
  id: string;
  placa: string;
  ruta_id: string;
  salida: string;
  servicio: 'expreso' | 'ordinario';
}

export interface FilaChofer {
  chofer_id: string;
  foto_url: string | null;
  nombre: string;
}

export interface FilaOcupacion {
  asiento: number;
  viaje_id: string;
}

/** todo lo que el pasajero y el conductor necesitan ver de los viajes publicados */
export interface ViajesPublicados {
  choferes: FilaChofer[];
  ocupacion: FilaOcupacion[];
  viajes: FilaViaje[];
}

/** los viajes de hoy en adelante con sus choferes y asientos vendidos; nulo si no hay servidor o no respondió */
export async function leerViajesPublicadosCon(
  cliente: SupabaseClient,
  desde: Date,
): Promise<ViajesPublicados | null> {
  try {
    const [viajes, choferes, ocupacion] = await Promise.all([
      cliente
        .from('viajes')
        .select(
          'id, chofer_id, ruta_id, servicio, placa, anden, salida, estado',
        )
        .gte('salida', desde.toISOString())
        .neq('estado', 'cancelado')
        .order('salida', { ascending: true }),
      cliente.from('perfiles_chofer').select('chofer_id, nombre, foto_url'),
      cliente.rpc('ocupacion_de_viajes'),
    ]);
    if (viajes.error || !viajes.data) return null;
    return {
      choferes:
        choferes.error || !choferes.data ? [] : (choferes.data as FilaChofer[]),
      ocupacion:
        ocupacion.error || !Array.isArray(ocupacion.data)
          ? []
          : (ocupacion.data as FilaOcupacion[]),
      viajes: viajes.data as FilaViaje[],
    };
  } catch {
    return null;
  }
}

export async function leerViajesPublicados(
  desde: Date,
): Promise<ViajesPublicados | null> {
  const cliente = obtenerCliente();
  return cliente ? leerViajesPublicadosCon(cliente, desde) : null;
}

export type ResultadoPublicarViaje = 'ok' | 'sin-servidor' | 'error';

/** publica un viaje nuevo del conductor */
export async function publicarViajeCon(
  cliente: SupabaseClient,
  fila: FilaViaje,
): Promise<ResultadoPublicarViaje> {
  try {
    const { error } = await cliente.from('viajes').insert(fila);
    return error ? 'error' : 'ok';
  } catch {
    return 'error';
  }
}

export async function publicarViaje(
  fila: FilaViaje,
): Promise<ResultadoPublicarViaje> {
  const cliente = obtenerCliente();
  return cliente ? publicarViajeCon(cliente, fila) : 'sin-servidor';
}

/**
 * quita un viaje del conductor: si nadie lo reservó se borra; si ya tiene pasajeros se marca
 * como cancelado para que dejen de verlo disponible
 */
export async function retirarViajeCon(
  cliente: SupabaseClient,
  viajeId: string,
  conPasajeros: boolean,
): Promise<boolean> {
  try {
    const { error } = conPasajeros
      ? await cliente
          .from('viajes')
          .update({ estado: 'cancelado' })
          .eq('id', viajeId)
      : await cliente.from('viajes').delete().eq('id', viajeId);
    return error === null;
  } catch {
    return false;
  }
}

export async function retirarViaje(
  viajeId: string,
  conPasajeros: boolean,
): Promise<boolean> {
  const cliente = obtenerCliente();
  return cliente ? retirarViajeCon(cliente, viajeId, conPasajeros) : false;
}
