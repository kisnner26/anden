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

/** deja un mensaje en la conversación; el servidor rechaza si el viaje ya no va en camino */
export async function enviarMensajeCon(
  cliente: SupabaseClient,
  mensaje: Pick<MensajeViaje, 'de' | 'hilo' | 'texto' | 'viajeId'>,
): Promise<boolean> {
  try {
    const { error } = await cliente.from('mensajes_viaje').insert({
      de: mensaje.de,
      hilo: mensaje.hilo,
      texto: mensaje.texto,
      viaje_id: mensaje.viajeId,
    });
    return error === null;
  } catch {
    return false;
  }
}

export async function enviarMensaje(
  mensaje: Pick<MensajeViaje, 'de' | 'hilo' | 'texto' | 'viajeId'>,
): Promise<boolean> {
  const cliente = obtenerCliente();
  return cliente ? enviarMensajeCon(cliente, mensaje) : false;
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
