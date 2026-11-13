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
  /** cuándo arrancó de verdad; nulo mientras espera pasajeros */
  salio_en?: string | null;
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
export interface FilaSalidaReal {
  ruta_id: string;
  salida: string;
  salio_en: string;
  servicio: string;
}

export interface ViajesPublicados {
  choferes: FilaChofer[];
  /** viajes que ya salieron, para aprender cuánto tarda en llenarse cada ruta */
  historial: FilaSalidaReal[];
  ocupacion: FilaOcupacion[];
  viajes: FilaViaje[];
}

/** los viajes de hoy en adelante con sus choferes y asientos vendidos; nulo si no hay servidor o no respondió */
export async function leerViajesPublicadosCon(
  cliente: SupabaseClient,
  desde: Date,
): Promise<ViajesPublicados | null> {
  try {
    const [viajes, choferes, ocupacion, historial] = await Promise.all([
      cliente
        .from('viajes')
        .select(
          'id, chofer_id, ruta_id, servicio, placa, anden, salida, estado, salio_en',
        )
        .gte('salida', desde.toISOString())
        .neq('estado', 'cancelado')
        .order('salida', { ascending: true }),
      cliente.from('perfiles_chofer').select('chofer_id, nombre, foto_url'),
      cliente.rpc('ocupacion_de_viajes'),
      cliente
        .from('viajes')
        .select('ruta_id, servicio, salida, salio_en')
        .not('salio_en', 'is', null)
        .limit(300),
    ]);
    if (viajes.error || !viajes.data) return null;
    return {
      historial:
        historial.error || !historial.data
          ? []
          : (historial.data as FilaSalidaReal[]),
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

export type ResultadoPublicarViaje =
  'error' | 'ok' | 'sin-permiso' | 'sin-servidor' | 'tabla-faltante';

/** qué falló al publicar, a partir del código que devuelve el servidor */
export function motivoDeFalla(
  codigo: string | undefined,
): ResultadoPublicarViaje {
  if (codigo === '42501') return 'sin-permiso';
  // la tabla no existe: el SQL de los viajes todavía no se corrió en Supabase
  if (codigo === '42P01' || codigo === 'PGRST205' || codigo === 'PGRST204') {
    return 'tabla-faltante';
  }
  return 'error';
}

/** publica un viaje nuevo del conductor */
export async function publicarViajeCon(
  cliente: SupabaseClient,
  fila: FilaViaje,
): Promise<ResultadoPublicarViaje> {
  try {
    const { error } = await cliente.from('viajes').insert(fila);
    return error ? motivoDeFalla(error.code) : 'ok';
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

/** marca que el bus ya arrancó: desde ahí sirve para calcular cuánto tarda en llenarse esa ruta */
export async function marcarSalidaCon(
  cliente: SupabaseClient,
  viajeId: string,
  cuando: Date,
): Promise<boolean> {
  try {
    const { error } = await cliente
      .from('viajes')
      .update({ salio_en: cuando.toISOString() })
      .eq('id', viajeId);
    return error === null;
  } catch {
    return false;
  }
}

export async function marcarSalida(viajeId: string): Promise<boolean> {
  const cliente = obtenerCliente();
  return cliente ? marcarSalidaCon(cliente, viajeId, new Date()) : false;
}
