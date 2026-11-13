import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import { leerConfiguracion } from './configuracion';
import { correoDeIdentificador, crearSesionSupabase } from './sesionSupabase';

function clienteFalso(opciones: {
  perfil?: {
    chofer_id: string | null;
    nombre: string;
    rol: string;
    usuario: string | null;
  } | null;
  disponible?: string;
  sesionAlRegistrar?: boolean;
  usuario?: { id: string } | null;
}) {
  const cerrar = jest.fn(async () => ({ error: null }));
  const consulta = {
    eq: () => consulta,
    maybeSingle: async () => ({ data: opciones.perfil ?? null, error: null }),
    select: () => consulta,
  };
  const cliente = {
    auth: {
      getSession: async () => ({
        data: { session: opciones.usuario ? { user: opciones.usuario } : null },
      }),
      signInWithPassword: async () =>
        opciones.usuario
          ? { data: { user: opciones.usuario }, error: null }
          : { data: { user: null }, error: new Error('no') },
      signOut: cerrar,
      signUp: async () =>
        opciones.sesionAlRegistrar === false
          ? { data: { session: null, user: { id: 'u1' } }, error: null }
          : {
              data: { session: {}, user: { id: 'u1' } },
              error: null,
            },
    },
    from: () => consulta,
    rpc: async (nombre: string) => ({
      data:
        nombre === 'acceso_disponible'
          ? (opciones.disponible ?? 'libre')
          : 'luis@cuentas.anden.app',
      error: null,
    }),
  };
  return { cerrar, cliente: cliente as unknown as SupabaseClient };
}

describe('configuración', () => {
  it('sin variables no hay configuración', () => {
    expect(leerConfiguracion({})).toBeNull();
  });

  it('exige https', () => {
    expect(
      leerConfiguracion({
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'k',
        EXPO_PUBLIC_SUPABASE_URL: 'http://x.supabase.co',
      }),
    ).toBeNull();
  });

  it('con las dos variables devuelve la configuración', () => {
    expect(
      leerConfiguracion({
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'k',
        EXPO_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
      }),
    ).toEqual({ claveAnonima: 'k', url: 'https://x.supabase.co' });
  });
});

describe('correoDeIdentificador', () => {
  it('arma un correo interno para teléfono o código', () => {
    expect(correoDeIdentificador('8888-1234')).toBe(
      '88881234@cuentas.anden.app',
    );
  });
});

describe('sesión con Supabase', () => {
  it('el rol sale del perfil', async () => {
    const { cliente } = clienteFalso({
      perfil: {
        chofer_id: 'cho_1',
        nombre: 'Luis',
        rol: 'conductor',
        usuario: null,
      },
      usuario: { id: 'u1' },
    });
    const resultado = await crearSesionSupabase(cliente).iniciar('1001', 'x');
    expect(resultado).toEqual({
      ok: true,
      valor: {
        choferId: 'cho_1',
        nombre: 'Luis',
        rol: 'conductor',
        usuario: undefined,
      },
    });
  });

  it('credenciales malas dan error', async () => {
    const { cliente } = clienteFalso({ usuario: null });
    const resultado = await crearSesionSupabase(cliente).iniciar('luis', 'x');
    expect(resultado.ok).toBe(false);
  });

  it('una cuenta sin perfil se cierra y no entra', async () => {
    const { cerrar, cliente } = clienteFalso({
      perfil: null,
      usuario: { id: 'u' },
    });
    const resultado = await crearSesionSupabase(cliente).iniciar('luis', 'x');
    expect(resultado.ok).toBe(false);
    expect(cerrar).toHaveBeenCalled();
  });

  it('sin sesión guardada no hay sesión actual', async () => {
    const { cliente } = clienteFalso({ usuario: null });
    expect(await crearSesionSupabase(cliente).actual()).toBeNull();
  });

  it('el correo no sirve para entrar', async () => {
    const { cliente } = clienteFalso({ usuario: { id: 'u' } });
    const resultado = await crearSesionSupabase(cliente).iniciar('a@b.c', 'x');
    expect(resultado.ok).toBe(false);
  });
});

describe('registro con Supabase', () => {
  const datos = {
    apellido: 'Pérez',
    clave: 'andén2026',
    nombre: 'Luis',
    telefono: '8888 1234',
    usuario: 'luis',
  };

  it('crea la cuenta y devuelve la sesión', async () => {
    const { cliente } = clienteFalso({
      perfil: {
        chofer_id: null,
        nombre: 'Luis Pérez',
        rol: 'pasajero',
        usuario: 'luis',
      },
    });
    const resultado = await crearSesionSupabase(cliente).registrar(datos);
    expect(resultado.ok && resultado.valor.usuario).toBe('luis');
  });

  it('avisa si el usuario o el teléfono ya existen', async () => {
    const { cliente } = clienteFalso({ disponible: 'usuario' });
    expect(await crearSesionSupabase(cliente).registrar(datos)).toEqual({
      error: 'usuario-tomado',
      ok: false,
    });
    const { cliente: otro } = clienteFalso({ disponible: 'telefono' });
    expect(await crearSesionSupabase(otro).registrar(datos)).toEqual({
      error: 'telefono-tomado',
      ok: false,
    });
  });

  it('si el servidor pide confirmar por correo lo dice', async () => {
    const { cliente } = clienteFalso({ sesionAlRegistrar: false });
    expect(await crearSesionSupabase(cliente).registrar(datos)).toEqual({
      error: 'confirmacion-pendiente',
      ok: false,
    });
  });
});
