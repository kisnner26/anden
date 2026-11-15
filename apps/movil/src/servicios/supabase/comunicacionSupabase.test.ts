import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  avisarAlViajeCon,
  buscarPasajerosCon,
  leerAvisosDelViajeCon,
} from './comunicacionSupabase';

function cliente(resultado: { data?: unknown; error: Error | null }) {
  const insert = jest.fn<(fila: unknown) => Promise<{ error: Error | null }>>(
    async () => ({ error: resultado.error }),
  );
  const eq = jest.fn(async () => ({ error: resultado.error }));
  const update = jest.fn<(cambios: unknown) => { eq: typeof eq }>(() => ({
    eq,
  }));
  const consulta = {
    eq: () => consulta,
    limit: async () => ({ data: resultado.data, error: resultado.error }),
    order: () => consulta,
  };
  const supabase = {
    from: () => ({ insert, select: () => consulta, update }),
  } as unknown as SupabaseClient;
  return { eq, insert, supabase, update };
}

describe('avisarAlViajeCon', () => {
  it('guarda el aviso con el viaje y el texto', async () => {
    const { insert, supabase } = cliente({ error: null });
    expect(await avisarAlViajeCon(supabase, 'via_x', 'Salimos en 10')).toBe(
      true,
    );
    expect(insert).toHaveBeenCalledWith({
      texto: 'Salimos en 10',
      viaje_id: 'via_x',
    });
  });

  it('dice falso si el servidor falla', async () => {
    const { supabase } = cliente({ error: new Error('x') });
    expect(await avisarAlViajeCon(supabase, 'via_x', 'hola')).toBe(false);
  });
});

describe('leerAvisosDelViajeCon', () => {
  it('devuelve los avisos', async () => {
    const aviso = { creado_en: '2026-11-15T10:00:00Z', id: 'a', texto: 'hola' };
    const { supabase } = cliente({ data: [aviso], error: null });
    expect(await leerAvisosDelViajeCon(supabase, 'via_x')).toEqual([aviso]);
  });

  it('nulo si el servidor falla', async () => {
    const { supabase } = cliente({ error: new Error('x') });
    expect(await leerAvisosDelViajeCon(supabase, 'via_x')).toBeNull();
  });
});

describe('buscarPasajerosCon', () => {
  it('enciende la búsqueda con hora y frase', async () => {
    const { supabase, update } = cliente({ error: null });
    const hasta = new Date('2026-11-15T12:00:00Z');
    expect(await buscarPasajerosCon(supabase, 'via_x', hasta, 'Salgo ya')).toBe(
      true,
    );
    expect(update).toHaveBeenCalledWith({
      busca_hasta: hasta.toISOString(),
      busca_mensaje: 'Salgo ya',
    });
  });

  it('la apaga dejando todo en nulo', async () => {
    const { supabase, update } = cliente({ error: null });
    await buscarPasajerosCon(supabase, 'via_x', null, 'ignorada');
    expect(update).toHaveBeenCalledWith({
      busca_hasta: null,
      busca_mensaje: null,
    });
  });
});
