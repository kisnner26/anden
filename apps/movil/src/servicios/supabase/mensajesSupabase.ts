import type { SupabaseClient } from '@supabase/supabase-js';

import type { AutorMensaje, MensajeViaje } from '@/datos/mensajesViaje';

import { obtenerCliente } from './cliente';

interface FilaMensaje {
  de: AutorMensaje;
  enviado_en: string;
  hilo: string;
  id: string;
  texto: string;
  viaje_id: string;
}

/** la fila del servidor como la usa la app */
export function mensajeDeFila(fila: FilaMensaje): MensajeViaje {
  return {
    de: fila.de,
    enviadoEn: fila.enviado_en,
    hilo: fila.hilo,
    id: fila.id,
    texto: fila.texto,
    viajeId: fila.viaje_id,
  };
}

/** por qué no se pudo enviar: el servidor lo rechazó por permisos, falta la tabla o no hubo conexión */
export type RazonFalloMensaje = 'fuera-de-viaje' | 'sin-conexion' | 'sin-tabla';

export type ResultadoEnvio =
  { ok: true } | { ok: false; razon: RazonFalloMensaje };

/** lo que dice el error de Postgres: 42501 es un permiso negado y 42P01 o PGRST205 una tabla que no existe */
export function razonDelError(error: { code?: string }): RazonFalloMensaje {
  if (error.code === '42501') return 'fuera-de-viaje';
  if (error.code === '42P01' || error.code === 'PGRST205') return 'sin-tabla';
  return 'sin-conexion';
}

/** deja un mensaje en la conversación; el servidor rechaza si el viaje ya no va en camino */
export async function enviarMensajeCon(
  cliente: SupabaseClient,
  mensaje: Pick<MensajeViaje, 'de' | 'hilo' | 'texto' | 'viajeId'>,
): Promise<ResultadoEnvio> {
  try {
    const { error } = await cliente.from('mensajes_viaje').insert({
      de: mensaje.de,
      hilo: mensaje.hilo,
      texto: mensaje.texto,
      viaje_id: mensaje.viajeId,
    });
    return error === null
      ? { ok: true }
      : { ok: false, razon: razonDelError(error) };
  } catch {
    return { ok: false, razon: 'sin-conexion' };
  }
}

export async function enviarMensaje(
  mensaje: Pick<MensajeViaje, 'de' | 'hilo' | 'texto' | 'viajeId'>,
): Promise<ResultadoEnvio> {
  const cliente = obtenerCliente();
  return cliente
    ? enviarMensajeCon(cliente, mensaje)
    : { ok: false, razon: 'sin-conexion' };
}

/** los mensajes de una conversación, de más viejo a más nuevo; nulo si no hay servidor o no respondió */
export async function leerMensajesCon(
  cliente: SupabaseClient,
  viajeId: string,
  hilo: string,
): Promise<MensajeViaje[] | null> {
  try {
    const { data, error } = await cliente
      .from('mensajes_viaje')
      .select('id, viaje_id, hilo, de, texto, enviado_en')
      .eq('viaje_id', viajeId)
      .eq('hilo', hilo)
      .order('enviado_en', { ascending: true })
      .limit(200);
    if (error || !data) return null;
    return (data as FilaMensaje[]).map(mensajeDeFila);
  } catch {
    return null;
  }
}

export async function leerMensajes(
  viajeId: string,
  hilo: string,
): Promise<MensajeViaje[] | null> {
  const cliente = obtenerCliente();
  return cliente ? leerMensajesCon(cliente, viajeId, hilo) : null;
}
