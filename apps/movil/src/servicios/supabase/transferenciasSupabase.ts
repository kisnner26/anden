import type { SupabaseClient } from '@supabase/supabase-js';

import {
  codigoCompleto,
  leerEstadoDeOferta,
  leerRespuestaDeReclamo,
  normalizarCodigo,
  type ErrorReclamo,
  type OfertaVista,
} from '@/datos/transferencia';
import type { BoletoGuardado } from '@/datos/reserva';

import { obtenerCliente } from './cliente';

/** ofrece un boleto propio y devuelve el código; nulo si no se pudo (sin cuenta, sin conexión o el boleto no vale) */
export async function crearTransferenciaCon(
  cliente: SupabaseClient,
  boletoId: string,
): Promise<string | null> {
  try {
    const { data, error } = await cliente.rpc('crear_transferencia', {
      p_boleto_id: boletoId,
    });
    if (error || typeof data !== 'string') return null;
    return codigoCompleto(data) ? normalizarCodigo(data) : null;
  } catch {
    return null;
  }
}

/** cómo va la oferta: esperando, recibida (y por quién), vencida o cancelada; nulo si no respondió */
export async function leerEstadoDeTransferenciaCon(
  cliente: SupabaseClient,
  codigo: string,
): Promise<OfertaVista | null> {
  try {
    const { data, error } = await cliente.rpc('estado_transferencia', {
      p_codigo: normalizarCodigo(codigo),
    });
    return error ? null : leerEstadoDeOferta(data);
  } catch {
    return null;
  }
}

/** canjea un código: devuelve el boleto ya con el nombre de quien lo recibe, o el motivo por el que no se pudo */
export async function reclamarTransferenciaCon(
  cliente: SupabaseClient,
  codigo: string,
): Promise<{ boleto: BoletoGuardado } | { error: ErrorReclamo }> {
  try {
    const { data, error } = await cliente.rpc('reclamar_transferencia', {
      p_codigo: normalizarCodigo(codigo),
    });
    if (error) return { error: 'conexion' };
    return leerRespuestaDeReclamo(data);
  } catch {
    return { error: 'conexion' };
  }
}

export async function cancelarTransferenciaCon(
  cliente: SupabaseClient,
  codigo: string,
): Promise<boolean> {
  try {
    const { error } = await cliente.rpc('cancelar_transferencia', {
      p_codigo: normalizarCodigo(codigo),
    });
    return error === null;
  } catch {
    return false;
  }
}

export const crearTransferencia = (boletoId: string) => {
  const cliente = obtenerCliente();
  return cliente
    ? crearTransferenciaCon(cliente, boletoId)
    : Promise.resolve(null);
};

export const leerEstadoDeTransferencia = (codigo: string) => {
  const cliente = obtenerCliente();
  return cliente
    ? leerEstadoDeTransferenciaCon(cliente, codigo)
    : Promise.resolve(null);
};

export const reclamarTransferencia = (codigo: string) => {
  const cliente = obtenerCliente();
  return cliente
    ? reclamarTransferenciaCon(cliente, codigo)
    : Promise.resolve({ error: 'conexion' as const });
};

export const cancelarTransferencia = (codigo: string) => {
  const cliente = obtenerCliente();
  return cliente
    ? cancelarTransferenciaCon(cliente, codigo)
    : Promise.resolve(false);
};
