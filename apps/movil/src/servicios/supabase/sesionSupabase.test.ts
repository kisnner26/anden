import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import { leerConfiguracion } from './configuracion';
import { correoDeIdentificador, crearSesionSupabase } from './sesionSupabase';

function clienteFalso(opciones: {
  perfil?: { chofer_id: string | null; nombre: string; rol: string } | null;
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
    },
    from: () => consulta,
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
  it('respeta un correo', () => {
    expect(correoDeIdentificador(' Ana@Correo.com ')).toBe('ana@correo.com');
  });

  it('arma un correo interno para teléfono o código', () => {
    expect(correoDeIdentificador('8888-1234')).toBe(
      '88881234@cuentas.anden.app',
    );
  });
});

describe('sesión con Supabase', () => {
  it('el rol sale del perfil', async () => {
    const { cliente } = clienteFalso({
      perfil: { chofer_id: 'cho_1', nombre: 'Luis', rol: 'conductor' },
      usuario: { id: 'u1' },
    });
    const resultado = await crearSesionSupabase(cliente).iniciar('1001', 'x');
    expect(resultado).toEqual({
      ok: true,
      valor: { choferId: 'cho_1', nombre: 'Luis', rol: 'conductor' },
    });
  });

  it('credenciales malas dan error', async () => {
    const { cliente } = clienteFalso({ usuario: null });
    const resultado = await crearSesionSupabase(cliente).iniciar('a@b.c', 'x');
    expect(resultado.ok).toBe(false);
  });

  it('una cuenta sin perfil se cierra y no entra', async () => {
    const { cerrar, cliente } = clienteFalso({
      perfil: null,
      usuario: { id: 'u' },
    });
    const resultado = await crearSesionSupabase(cliente).iniciar('a@b.c', 'x');
    expect(resultado.ok).toBe(false);
    expect(cerrar).toHaveBeenCalled();
  });

  it('sin sesión guardada no hay sesión actual', async () => {
    const { cliente } = clienteFalso({ usuario: null });
    expect(await crearSesionSupabase(cliente).actual()).toBeNull();
  });
});
