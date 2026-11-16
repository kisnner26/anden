import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  enviarMensajeCon,
  leerMensajesCon,
  razonDelError,
} from './mensajesSupabase';

function cliente(resultado: { data?: unknown; error: Error | null }) {
  const insert = jest.fn<(fila: unknown) => Promise<{ error: Error | null }>>(
    async () => ({ error: resultado.error }),
  );
  const consulta = {
    eq: () => consulta,
    limit: async () => ({ data: resultado.data, error: resultado.error }),
    order: () => consulta,
  };
  const supabase = {
    from: () => ({ insert, select: () => consulta }),
  } as unknown as SupabaseClient;
  return { insert, supabase };
}

describe('enviarMensajeCon', () => {
  it('guarda el mensaje con el viaje, el boleto y quién lo escribe', async () => {
    const { insert, supabase } = cliente({ error: null });
    const enviado = await enviarMensajeCon(supabase, {
      de: 'pasajero',
      hilo: 'bol_1',
      texto: 'ya estoy en la parada',
      viajeId: 'via_2',
    });
    expect(enviado).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith({
      de: 'pasajero',
      hilo: 'bol_1',
      texto: 'ya estoy en la parada',
      viaje_id: 'via_2',
    });
  });

  it('si el servidor lo rechaza por permisos dice que el viaje no está en camino', async () => {
    const { supabase } = cliente({
      error: Object.assign(new Error('rls'), { code: '42501' }),
    });
    expect(
      await enviarMensajeCon(supabase, {
        de: 'chofer',
        hilo: 'bol_1',
        texto: 'hola',
        viajeId: 'via_2',
      }),
    ).toEqual({ ok: false, razon: 'fuera-de-viaje' });
  });
});

describe('razonDelError', () => {
  it('un permiso negado es un viaje fuera de camino', () => {
    expect(razonDelError({ code: '42501' })).toBe('fuera-de-viaje');
  });

  it('una tabla que no existe es un servidor sin preparar', () => {
    expect(razonDelError({ code: '42P01' })).toBe('sin-tabla');
    expect(razonDelError({ code: 'PGRST205' })).toBe('sin-tabla');
  });

  it('cualquier otro error se trata como falta de conexión', () => {
    expect(razonDelError({})).toBe('sin-conexion');
    expect(razonDelError({ code: '08006' })).toBe('sin-conexion');
  });
});

describe('leerMensajesCon', () => {
  it('devuelve los mensajes con los nombres de la app', async () => {
    const fila = {
      de: 'chofer',
      enviado_en: '2026-11-16T10:00:00Z',
      hilo: 'bol_1',
      id: 'm1',
      texto: 'voy llegando',
      viaje_id: 'via_2',
    };
    const { supabase } = cliente({ data: [fila], error: null });
    expect(await leerMensajesCon(supabase, 'via_2', 'bol_1')).toEqual([
      {
        de: 'chofer',
        enviadoEn: '2026-11-16T10:00:00Z',
        hilo: 'bol_1',
        id: 'm1',
        texto: 'voy llegando',
        viajeId: 'via_2',
      },
    ]);
  });

  it('devuelve nulo si el servidor falla', async () => {
    const { supabase } = cliente({ error: new Error('x') });
    expect(await leerMensajesCon(supabase, 'via_2', 'bol_1')).toBeNull();
  });
});
