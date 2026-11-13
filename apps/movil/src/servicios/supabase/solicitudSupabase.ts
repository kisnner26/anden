import type { SupabaseClient } from '@supabase/supabase-js';

import { resolverFoto } from '@/datos/almacenFotos';

import type {
  EstadoSolicitud,
  ServicioSolicitud,
  SolicitudConductor,
} from '../solicitudConductor';

interface FilaSolicitud {
  apellido: string;
  cedula: string;
  creada_en: string;
  estado: 'aprobada' | 'en_revision' | 'rechazada';
  foto_dorso: string;
  foto_frente: string;
  nombre: string;
  telefono: string;
}

const BUCKET = 'cedulas';

const ESTADOS: Record<FilaSolicitud['estado'], EstadoSolicitud> = {
  aprobada: 'aprobada',
  en_revision: 'en-revision',
  rechazada: 'rechazada',
};

/** la extensión del archivo de la foto, para nombrar bien lo que se sube */
export function extensionDeFoto(ruta: string): string {
  return /\.(jpe?g|png|heic|webp)$/i.exec(ruta)?.[1]?.toLowerCase() ?? 'jpg';
}

async function subir(
  cliente: SupabaseClient,
  usuarioId: string,
  lado: 'dorso' | 'frente',
  referencia: string,
): Promise<string> {
  const ruta = `${usuarioId}/${lado}.${extensionDeFoto(referencia)}`;
  const respuesta = await fetch(resolverFoto(referencia));
  const { error } = await cliente.storage
    .from(BUCKET)
    .upload(ruta, await respuesta.arrayBuffer(), {
      contentType: `image/${extensionDeFoto(referencia) === 'jpg' ? 'jpeg' : extensionDeFoto(referencia)}`,
      upsert: true,
    });
  if (error) throw new Error('subida');
  return ruta;
}

/** la solicitud en la tabla `solicitudes_conductor`; la aprobación la hace la cooperativa desde el servidor, nunca la app */
export function crearSolicitudSupabase(
  cliente: SupabaseClient,
): ServicioSolicitud {
  async function usuario(): Promise<string | null> {
    const { data } = await cliente.auth.getUser();
    return data.user?.id ?? null;
  }

  return {
    async descartar() {
      const id = await usuario();
      if (!id) return;
      await cliente.from('solicitudes_conductor').delete().eq('usuario_id', id);
    },
    async guardar(solicitud) {
      const id = await usuario();
      if (!id) throw new Error('sin-sesion');
      const frente = await subir(
        cliente,
        id,
        'frente',
        solicitud.cedulaFrenteUri,
      );
      const dorso = await subir(cliente, id, 'dorso', solicitud.cedulaDorsoUri);
      const { error } = await cliente.from('solicitudes_conductor').insert({
        apellido: solicitud.apellido,
        biometria_confirmada: true,
        cedula: solicitud.cedula,
        foto_dorso: dorso,
        foto_frente: frente,
        nombre: solicitud.nombre,
        telefono: solicitud.telefono,
        usuario_id: id,
      });
      if (error) throw new Error('registro');
    },
    async leer() {
      const id = await usuario();
      if (!id) return null;
      const { data } = await cliente
        .from('solicitudes_conductor')
        .select(
          'nombre, apellido, telefono, cedula, foto_frente, foto_dorso, estado, creada_en',
        )
        .eq('usuario_id', id)
        .maybeSingle<FilaSolicitud>();
      if (!data) return null;
      const solicitud: SolicitudConductor = {
        apellido: data.apellido,
        biometriaConfirmada: true,
        cedula: data.cedula,
        cedulaDorsoUri: data.foto_dorso,
        cedulaFrenteUri: data.foto_frente,
        creadaEn: data.creada_en,
        estado: ESTADOS[data.estado],
        nombre: data.nombre,
        telefono: data.telefono,
      };
      return solicitud;
    },
  };
}
