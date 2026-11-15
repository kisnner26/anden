import { describe, expect, it } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import { crearGrupoCon, verGrupoCon } from './grupoSupabase';

function cliente(resultado: { data?: unknown; error?: Error | null }) {
  return {
    rpc: async () => ({ data: resultado.data, error: resultado.error ?? null }),
  } as unknown as SupabaseClient;
}

describe('crearGrupoCon', () => {
  it('devuelve el código que dio el servidor', async () => {
    expect(await crearGrupoCon(cliente({ data: 'AB12CD34' }), 'via_x', 4)).toBe(
      'AB12CD34',
    );
  });

  it('nulo si el servidor rechaza', async () => {
    expect(
      await crearGrupoCon(
        cliente({ error: new Error('ya salió') }),
        'via_x',
        4,
      ),
    ).toBeNull();
  });
});

describe('verGrupoCon', () => {
  it('devuelve el avance del grupo', async () => {
    const estado = {
      cupo: 4,
      expira_en: '2026-11-15T12:00:00Z',
      miembros: [{ asiento: 7, nombre: 'Ana' }],
      vencido: false,
      viaje_id: 'via_x',
    };
    expect(await verGrupoCon(cliente({ data: estado }), 'AB12CD34')).toEqual(
      estado,
    );
  });

  it('nulo si el grupo no existe', async () => {
    expect(await verGrupoCon(cliente({ data: null }), 'XXXX')).toBeNull();
  });
});
