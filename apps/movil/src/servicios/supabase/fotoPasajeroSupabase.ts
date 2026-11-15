import type { SupabaseClient } from '@supabase/supabase-js';

import { resolverFoto } from '@/datos/almacenFotos';

import { obtenerCliente } from './cliente';
import { extensionDeFoto } from './solicitudSupabase';

const BUCKET = 'fotos-pasajeros';

/** las fotos ya subidas en esta sesión, para no volver a subir la misma cada vez que se publica un boleto */
const subidas = new Map<string, string>();

/** sube la foto local del pasajero y devuelve su dirección pública; nulo si no se pudo */
export async function subirFotoDePasajeroCon(
  cliente: SupabaseClient,
  referencia: string,
): Promise<string | null> {
  const previa = subidas.get(referencia);
  if (previa) return previa;
  try {
    const { data } = await cliente.auth.getUser();
    const usuario = data.user?.id;
    if (!usuario) return null;
    const extension = extensionDeFoto(referencia);
    const ruta = `${usuario}/foto-${Date.now()}.${extension}`;
    const respuesta = await fetch(resolverFoto(referencia));
    const { error } = await cliente.storage
      .from(BUCKET)
      .upload(ruta, await respuesta.arrayBuffer(), {
        contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
        upsert: true,
      });
    if (error) return null;
    const url = cliente.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
    subidas.set(referencia, url);
    return url;
  } catch {
    return null;
  }
}

export async function subirFotoDePasajero(
  referencia: string,
): Promise<string | null> {
  const cliente = obtenerCliente();
  return cliente ? subirFotoDePasajeroCon(cliente, referencia) : null;
}

/** solo para las pruebas */
export function olvidarFotosSubidas(): void {
  subidas.clear();
}
