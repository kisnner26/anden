import type { SupabaseClient } from '@supabase/supabase-js';

import { obtenerCliente } from './cliente';

/** un viaje tal como lo publica el conductor */
export interface FilaViaje {
  /** Plus Code de dónde se sube al bus; nulo en los viajes publicados antes de que existiera */
  punto_encuentro: string | null;
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
  /** viajes que el conductor canceló: los pasajeros con boleto deben enterarse */
  cancelados?: string[];
  /** el motivo que dio el conductor al cancelar, por viaje; falta si no lo dio o el servidor no lo guarda todavía */
  motivos?: Record<string, string>;
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
    const [viajes, choferes, ocupacion, historial, cancelados] =
      await Promise.all([
        cliente
          .from('viajes')
          .select(
            'id, chofer_id, ruta_id, servicio, placa, punto_encuentro, salida, estado, salio_en',
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
        cliente
          .from('viajes')
          .select('id, motivo_cancelacion')
          .eq('estado', 'cancelado')
          .gte('salida', desde.toISOString()),
      ]);
    // si el servidor todavía no tiene la columna del motivo, se piden solo los viajes cancelados
    const sinMotivo = cancelados.error
      ? await cliente
          .from('viajes')
          .select('id')
          .eq('estado', 'cancelado')
          .gte('salida', desde.toISOString())
      : null;
    const filasCanceladas = (sinMotivo ?? cancelados).data as
      { id: string; motivo_cancelacion?: string | null }[] | null;
    const errorCancelados = (sinMotivo ?? cancelados).error;
    if (viajes.error || !viajes.data) return null;
    return {
      cancelados:
        errorCancelados || !filasCanceladas
          ? []
          : filasCanceladas.map((fila) => fila.id),
      motivos:
        errorCancelados || !filasCanceladas
          ? {}
          : Object.fromEntries(
              filasCanceladas.flatMap((fila) =>
                fila.motivo_cancelacion
                  ? [[fila.id, fila.motivo_cancelacion]]
                  : [],
              ),
            ),
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
  motivo?: string,
): Promise<boolean> {
  try {
    if (!conPasajeros) {
      const { error } = await cliente.from('viajes').delete().eq('id', viajeId);
      return error === null;
    }
    if (motivo) {
      const conMotivo = await cliente
        .from('viajes')
        .update({ estado: 'cancelado', motivo_cancelacion: motivo })
        .eq('id', viajeId);
      if (conMotivo.error === null) return true;
      // si el servidor todavía no guarda el motivo, igual se cancela el viaje
    }
    const { error } = await cliente
      .from('viajes')
      .update({ estado: 'cancelado' })
      .eq('id', viajeId);
    return error === null;
  } catch {
    return false;
  }
}

export async function retirarViaje(
  viajeId: string,
  conPasajeros: boolean,
  motivo?: string,
): Promise<boolean> {
  const cliente = obtenerCliente();
  return cliente
    ? retirarViajeCon(cliente, viajeId, conPasajeros, motivo)
    : false;
}

/** el conductor cerró el viaje al llegar: los pasajeros con boleto lo ven como llegado */
export async function marcarLlegadaCon(
  cliente: SupabaseClient,
  viajeId: string,
): Promise<boolean> {
  try {
    const { error } = await cliente
      .from('viajes')
      .update({ estado: 'llego' })
      .eq('id', viajeId);
    return error === null;
  } catch {
    return false;
  }
}

export async function marcarLlegada(viajeId: string): Promise<boolean> {
  const cliente = obtenerCliente();
  return cliente ? marcarLlegadaCon(cliente, viajeId) : false;
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
