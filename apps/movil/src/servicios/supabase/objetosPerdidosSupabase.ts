import type { SupabaseClient } from '@supabase/supabase-js';

import { resolverFoto } from '@/datos/almacenFotos';

import { obtenerCliente } from './cliente';
import { extensionDeFoto } from './solicitudSupabase';

const BUCKET = 'objetos-perdidos';

export interface ObjetoPerdido {
  creado_en: string;
  descripcion: string;
  foto_url: string | null;
  id: string;
  reclamado_en: string | null;
  viaje_id: string;
}

/** sube la foto del objeto a la carpeta del chofer y devuelve su dirección; nulo si no se pudo */
async function subirFoto(
  cliente: SupabaseClient,
  referencia: string,
): Promise<string | null> {
  try {
    const { data } = await cliente.auth.getUser();
    const usuario = data.user?.id;
    if (!usuario) return null;
    const extension = extensionDeFoto(referencia);
    const ruta = `${usuario}/objeto-${Date.now()}.${extension}`;
    const respuesta = await fetch(resolverFoto(referencia));
    const { error } = await cliente.storage
      .from(BUCKET)
      .upload(ruta, await respuesta.arrayBuffer(), {
        contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      });
    if (error) return null;
    return cliente.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
  } catch {
    return null;
  }
}

/** el chofer reporta un objeto que quedó en el bus, con foto si la tomó; devuelve falso si no se pudo guardar */
export async function reportarObjetoCon(
  cliente: SupabaseClient,
  viajeId: string,
  descripcion: string,
  foto: string | null,
): Promise<boolean> {
  try {
    const url = foto ? await subirFoto(cliente, foto) : null;
    const { error } = await cliente
      .from('objetos_perdidos')
      .insert({ descripcion, foto_url: url, viaje_id: viajeId });
    return error === null;
  } catch {
    return false;
  }
}

export async function reportarObjeto(
  viajeId: string,
  descripcion: string,
  foto: string | null,
): Promise<boolean> {
  const cliente = obtenerCliente();
  return cliente
    ? reportarObjetoCon(cliente, viajeId, descripcion, foto)
    : false;
}

/** los objetos que el chofer reportó de un viaje; nulo si no hay servidor o no respondió */
export async function leerObjetosDelViajeCon(
  cliente: SupabaseClient,
  viajeId: string,
): Promise<ObjetoPerdido[] | null> {
  try {
    const { data, error } = await cliente
      .from('objetos_perdidos')
      .select('id, viaje_id, descripcion, foto_url, creado_en, reclamado_en')
      .eq('viaje_id', viajeId)
      .order('creado_en', { ascending: false });
    if (error || !data) return null;
    return data as ObjetoPerdido[];
  } catch {
    return null;
  }
}

export async function leerObjetosDelViaje(
  viajeId: string,
): Promise<ObjetoPerdido[] | null> {
  const cliente = obtenerCliente();
  return cliente ? leerObjetosDelViajeCon(cliente, viajeId) : null;
}

/** "es mío": el servidor lo da solo a quien tuvo boleto en ese viaje y solo al primero que lo pide */
export async function reclamarObjetoCon(
  cliente: SupabaseClient,
  objetoId: string,
): Promise<boolean> {
  try {
    const { data, error } = await cliente.rpc('reclamar_objeto', {
      p_id: objetoId,
    });
    return !error && data === true;
  } catch {
    return false;
  }
}

export async function reclamarObjeto(objetoId: string): Promise<boolean> {
  const cliente = obtenerCliente();
  return cliente ? reclamarObjetoCon(cliente, objetoId) : false;
}
