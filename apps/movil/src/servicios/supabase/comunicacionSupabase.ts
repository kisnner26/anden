import type { SupabaseClient } from '@supabase/supabase-js';

import { obtenerCliente } from './cliente';

export interface AvisoDelViaje {
  creado_en: string;
  id: string;
  texto: string;
}

/** el chofer le avisa a quienes tienen boleto en su viaje */
export async function avisarAlViajeCon(
  cliente: SupabaseClient,
  viajeId: string,
  texto: string,
): Promise<boolean> {
  try {
    const { error } = await cliente
      .from('avisos_viaje')
      .insert({ texto, viaje_id: viajeId });
    return error === null;
  } catch {
    return false;
  }
}

export async function avisarAlViaje(
  viajeId: string,
  texto: string,
): Promise<boolean> {
  const cliente = obtenerCliente();
  return cliente ? avisarAlViajeCon(cliente, viajeId, texto) : false;
}

/** los avisos más recientes del chofer de un viaje; nulo si no hay servidor o no respondió */
export async function leerAvisosDelViajeCon(
  cliente: SupabaseClient,
  viajeId: string,
  limite = 3,
): Promise<AvisoDelViaje[] | null> {
  try {
    const { data, error } = await cliente
      .from('avisos_viaje')
      .select('id, texto, creado_en')
      .eq('viaje_id', viajeId)
      .order('creado_en', { ascending: false })
      .limit(limite);
    if (error || !data) return null;
    return data as AvisoDelViaje[];
  } catch {
    return null;
  }
}

export async function leerAvisosDelViaje(
  viajeId: string,
): Promise<AvisoDelViaje[] | null> {
  const cliente = obtenerCliente();
  return cliente ? leerAvisosDelViajeCon(cliente, viajeId) : null;
}

async function pedirTelefono(
  cliente: SupabaseClient,
  funcion: 'telefono_del_chofer' | 'telefono_del_pasajero',
  parametros: { p_boleto: string } | { p_viaje: string },
): Promise<string | null> {
  try {
    const { data, error } = await cliente.rpc(funcion, parametros);
    return error || typeof data !== 'string' || data === '' ? null : data;
  } catch {
    return null;
  }
}

/** el teléfono del chofer, solo para quien tiene boleto vigente en ese viaje y dentro de la ventana de tiempo */
export async function telefonoDelChofer(
  viajeId: string,
): Promise<string | null> {
  const cliente = obtenerCliente();
  return cliente
    ? pedirTelefono(cliente, 'telefono_del_chofer', { p_viaje: viajeId })
    : null;
}

/** el teléfono de quien reservó el boleto, solo para el chofer de ese viaje y dentro de la ventana de tiempo */
export async function telefonoDelPasajero(
  boletoId: string,
): Promise<string | null> {
  const cliente = obtenerCliente();
  return cliente
    ? pedirTelefono(cliente, 'telefono_del_pasajero', { p_boleto: boletoId })
    : null;
}

/** enciende o apaga el "buscar pasajeros" de un viaje; con `hasta` nulo se apaga */
export async function buscarPasajerosCon(
  cliente: SupabaseClient,
  viajeId: string,
  hasta: Date | null,
  mensaje: string | null,
): Promise<boolean> {
  try {
    const { error } = await cliente
      .from('viajes')
      .update({
        busca_hasta: hasta ? hasta.toISOString() : null,
        busca_mensaje: hasta ? mensaje : null,
      })
      .eq('id', viajeId);
    return error === null;
  } catch {
    return false;
  }
}

export async function buscarPasajeros(
  viajeId: string,
  hasta: Date | null,
  mensaje: string | null,
): Promise<boolean> {
  const cliente = obtenerCliente();
  return cliente ? buscarPasajerosCon(cliente, viajeId, hasta, mensaje) : false;
}
