import { error, normalizarUsuario, ok, telefonoClave } from '@anden/dominio';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  esCorreo,
  type Rol,
  type ServicioSesion,
  type Sesion,
} from '../sesion';

/** dominio interno con el que se arman los correos de quien entra con teléfono o código de chofer */
export const DOMINIO_INTERNO = 'cuentas.anden.app';

/** el correo interno de un código de chofer o de un usuario que no existe; con arroba no hay correo posible */
export function correoDeIdentificador(identificador: string): string {
  const texto = identificador.trim().toLowerCase().replace(/[\s-]/g, '');
  return `${texto}@${DOMINIO_INTERNO}`;
}

interface FilaPerfil {
  chofer_id: string | null;
  nombre: string;
  rol: Rol;
  usuario: string | null;
}

async function leerPerfil(
  cliente: SupabaseClient,
  usuarioId: string,
): Promise<Sesion | null> {
  const { data, error: falla } = await cliente
    .from('perfiles')
    .select('nombre, rol, chofer_id, usuario')
    .eq('id', usuarioId)
    .maybeSingle<FilaPerfil>();
  if (falla || !data) return null;
  return {
    choferId: data.chofer_id ?? undefined,
    nombre: data.nombre,
    rol: data.rol,
    usuario: data.usuario ?? undefined,
  };
}

/** cuentas en Supabase Auth; el rol sale de la tabla `perfiles`, nunca de lo que la persona elige */
export function crearSesionSupabase(cliente: SupabaseClient): ServicioSesion {
  return {
    async actual() {
      const { data } = await cliente.auth.getSession();
      const usuario = data.session?.user;
      return usuario ? leerPerfil(cliente, usuario.id) : null;
    },
    async cerrar() {
      await cliente.auth.signOut();
    },
    async iniciar(identificador, clave) {
      if (esCorreo(identificador)) return error('credenciales');
      // el servidor sabe qué cuenta es: por usuario, por teléfono o por código de chofer
      const { data: correo } = await cliente.rpc('correo_de_acceso', {
        p_identificador: identificador,
      });
      const { data, error: falla } = await cliente.auth.signInWithPassword({
        email:
          typeof correo === 'string'
            ? correo
            : correoDeIdentificador(identificador),
        password: clave,
      });
      if (falla || !data.user) return error('credenciales');
      const sesion = await leerPerfil(cliente, data.user.id);
      if (!sesion) {
        await cliente.auth.signOut();
        return error('credenciales');
      }
      return ok(sesion);
    },
    async registrar(datos) {
      const usuario = normalizarUsuario(datos.usuario);
      const telefono = telefonoClave(datos.telefono);
      const { data: libre, error: fallaRevision } = await cliente.rpc(
        'acceso_disponible',
        { p_telefono: telefono, p_usuario: usuario },
      );
      if (fallaRevision) return error('conexion');
      if (libre === 'usuario') return error('usuario-tomado');
      if (libre === 'telefono') return error('telefono-tomado');

      const { data, error: falla } = await cliente.auth.signUp({
        email: correoDeIdentificador(usuario),
        options: {
          data: {
            apellido: datos.apellido.trim(),
            nombre: `${datos.nombre.trim()} ${datos.apellido.trim()}`,
            telefono,
            usuario,
          },
        },
        password: datos.clave,
      });
      if (falla) return error('conexion');
      // con la confirmación por correo encendida no hay sesión: en el panel hay que apagarla
      if (!data.session || !data.user) return error('confirmacion-pendiente');
      const sesion = await leerPerfil(cliente, data.user.id);
      return sesion ? ok(sesion) : error('conexion');
    },
  };
}
