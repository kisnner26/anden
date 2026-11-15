import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  leerObjetosDelViajeCon,
  reclamarObjetoCon,
  reportarObjetoCon,
} from './objetosPerdidosSupabase';

function cliente(opciones: {
  data?: unknown;
  error?: Error | null;
  rpc?: unknown;
}) {
  const error = opciones.error ?? null;
  const insert = jest.fn<(fila: unknown) => Promise<{ error: Error | null }>>(
    async () => ({ error }),
  );
  const consulta = {
    eq: () => consulta,
    order: async () => ({ data: opciones.data, error }),
  };
  const supabase = {
    from: () => ({ insert, select: () => consulta }),
    rpc: async () => ({ data: opciones.rpc, error }),
  } as unknown as SupabaseClient;
  return { insert, supabase };
}

describe('reportarObjetoCon', () => {
  it('guarda el objeto con el viaje y la descripción', async () => {
    const { insert, supabase } = cliente({});
    expect(
      await reportarObjetoCon(supabase, 'via_x', 'Mochila negra', null),
    ).toBe(true);
    expect(insert).toHaveBeenCalledWith({
      descripcion: 'Mochila negra',
      foto_url: null,
      viaje_id: 'via_x',
    });
  });

  it('falso si el servidor falla', async () => {
    const { supabase } = cliente({ error: new Error('x') });
    expect(await reportarObjetoCon(supabase, 'via_x', 'Mochila', null)).toBe(
      false,
    );
  });
});

describe('leerObjetosDelViajeCon', () => {
  it('devuelve los objetos del viaje', async () => {
    const objeto = { descripcion: 'Mochila', id: 'o1' };
    const { supabase } = cliente({ data: [objeto] });
    expect(await leerObjetosDelViajeCon(supabase, 'via_x')).toEqual([objeto]);
  });

  it('nulo si falla', async () => {
    const { supabase } = cliente({ error: new Error('x') });
    expect(await leerObjetosDelViajeCon(supabase, 'via_x')).toBeNull();
  });
});

describe('reclamarObjetoCon', () => {
  it('verdadero solo si el servidor lo concedió', async () => {
    expect(await reclamarObjetoCon(cliente({ rpc: true }).supabase, 'o1')).toBe(
      true,
    );
    expect(
      await reclamarObjetoCon(cliente({ rpc: false }).supabase, 'o1'),
    ).toBe(false);
  });
});
