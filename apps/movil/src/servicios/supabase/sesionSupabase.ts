import { error, ok } from '@anden/dominio';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Rol, ServicioSesion, Sesion } from '../sesion';

/** dominio interno con el que se arman los correos de quien entra con teléfono o código de chofer */
export const DOMINIO_INTERNO = 'cuentas.anden.app';

/** lo escrito en el ingreso a un correo: si ya es correo se usa, si es teléfono o código se le arma uno */
export function correoDeIdentificador(identificador: string): string {
  const texto = identificador.trim().toLowerCase();
  if (texto.includes('@')) return texto;
  return `${texto.replace(/[\s-]/g, '')}@${DOMINIO_INTERNO}`;
}

interface FilaPerfil {
  chofer_id: string | null;
  nombre: string;
  rol: Rol;
}

async function leerPerfil(
  cliente: SupabaseClient,
  usuarioId: string,
): Promise<Sesion | null> {
  const { data, error: falla } = await cliente
    .from('perfiles')
    .select('nombre, rol, chofer_id')
    .eq('id', usuarioId)
    .maybeSingle<FilaPerfil>();
  if (falla || !data) return null;
  return {
    choferId: data.chofer_id ?? undefined,
    nombre: data.nombre,
    rol: data.rol,
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
      const { data, error: falla } = await cliente.auth.signInWithPassword({
        email: correoDeIdentificador(identificador),
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
  };
}
