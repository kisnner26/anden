import type { SupabaseClient } from '@supabase/supabase-js';

import { resolverFoto } from '@/datos/almacenFotos';

import { obtenerCliente } from './cliente';
import { extensionDeFoto } from './solicitudSupabase';

const BUCKET = 'fotos-choferes';

/** lo que el pasajero ve de su chofer */
export interface PerfilPublicoChofer {
  fotoUrl: string | null;
  nombre: string;
}

interface FilaPerfilChofer {
  foto_url: string | null;
  nombre: string;
}

/** sube la foto local del conductor y devuelve su dirección pública; cada foto nueva tiene su propio nombre para que nadie vea una vieja guardada */
async function subirFoto(
  cliente: SupabaseClient,
  choferId: string,
  referencia: string,
): Promise<string> {
  const extension = extensionDeFoto(referencia);
  const ruta = `${choferId}/foto-${Date.now()}.${extension}`;
  const respuesta = await fetch(resolverFoto(referencia));
  const { error } = await cliente.storage
    .from(BUCKET)
    .upload(ruta, await respuesta.arrayBuffer(), {
      contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      upsert: true,
    });
  if (error) throw new Error('subida');
  return cliente.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
}

/**
 * publica el nombre y la foto del conductor para que los pasajeros los vean; una foto que ya
 * es una dirección pública no se vuelve a subir. Devuelve la dirección pública de la foto
 * (o nulo sin foto), o `undefined` si no se pudo publicar.
 */
export async function publicarPerfilChoferCon(
  cliente: SupabaseClient,
  choferId: string,
  nombre: string,
  foto: string | null,
): Promise<string | null | undefined> {
  try {
    const fotoUrl =
      foto === null || /^https?:\/\//.test(foto)
        ? foto
        : await subirFoto(cliente, choferId, foto);
    const { error } = await cliente.from('perfiles_chofer').upsert(
      {
        actualizado_en: new Date().toISOString(),
        chofer_id: choferId,
        foto_url: fotoUrl,
        nombre,
      },
      { onConflict: 'chofer_id' },
    );
    return error ? undefined : fotoUrl;
  } catch {
    return undefined;
  }
}

export async function publicarPerfilChofer(
  choferId: string,
  nombre: string,
  foto: string | null,
): Promise<string | null | undefined> {
  const cliente = obtenerCliente();
  if (!cliente) return undefined;
  return publicarPerfilChoferCon(cliente, choferId, nombre, foto);
}

/** el perfil público de un chofer; nulo si todavía no publicó nada o el servidor no respondió */
export async function leerPerfilChoferCon(
  cliente: SupabaseClient,
  choferId: string,
): Promise<PerfilPublicoChofer | null> {
  try {
    const { data, error } = await cliente
      .from('perfiles_chofer')
      .select('nombre, foto_url')
      .eq('chofer_id', choferId)
      .maybeSingle();
    if (error || !data) return null;
    const fila = data as FilaPerfilChofer;
    return { fotoUrl: fila.foto_url, nombre: fila.nombre };
  } catch {
    return null;
  }
}

export async function leerPerfilChofer(
  choferId: string,
): Promise<PerfilPublicoChofer | null> {
  const cliente = obtenerCliente();
  if (!cliente) return null;
  return leerPerfilChoferCon(cliente, choferId);
}
