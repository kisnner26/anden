import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  leerViajesPublicadosCon,
  publicarViajeCon,
  retirarViajeCon,
  type FilaViaje,
} from './viajesSupabase';

const FILA: FilaViaje = {
  anden: 2,
  chofer_id: 'cho_1',
  estado: 'programado',
  id: 'via_x',
  placa: 'M 1-2',
  ruta_id: 'rut_may_boa',
  salida: '2026-11-14T15:00:00.000Z',
  servicio: 'ordinario',
};

function cliente(opciones: { error?: boolean } = {}) {
  const error = opciones.error ? new Error('x') : null;
  const insert = jest.fn<(fila: unknown) => Promise<{ error: Error | null }>>(
    async () => ({ error }),
  );
  const actualizar = jest.fn(async () => ({ error }));
  const borrar = jest.fn(async () => ({ error }));
  const consulta = (data: unknown[]) => {
    const resultado = { data: opciones.error ? null : data, error };
    const cadena: Record<string, unknown> = {
      eq: () => cadena,
      gte: () => cadena,
      limit: async () => resultado,
      neq: () => cadena,
      not: () => cadena,
      order: async () => resultado,
      then: undefined,
    };
    return cadena;
  };
  const supabase = {
    from: (tabla: string) => {
      if (tabla === 'viajes') {
        return {
          delete: () => ({ eq: borrar }),
          insert,
          select: () => consulta([FILA]),
          update: () => ({ eq: actualizar }),
        };
      }
      return {
        select: async () => ({
          data: [{ chofer_id: 'cho_1', foto_url: null, nombre: 'Ernesto' }],
          error: null,
        }),
      };
    },
    rpc: async () => ({
      data: [{ asiento: 3, viaje_id: 'via_x' }],
      error: null,
    }),
  } as unknown as SupabaseClient;
  return { actualizar, borrar, insert, supabase };
}

describe('leerViajesPublicadosCon', () => {
  it('junta viajes, choferes y asientos vendidos', async () => {
    const { supabase } = cliente();
    const lectura = await leerViajesPublicadosCon(supabase, new Date());
    expect(lectura?.viajes).toHaveLength(1);
    expect(lectura?.choferes[0]?.nombre).toBe('Ernesto');
    expect(lectura?.ocupacion).toEqual([{ asiento: 3, viaje_id: 'via_x' }]);
  });

  it('nulo si el servidor falla', async () => {
    const { supabase } = cliente({ error: true });
    expect(await leerViajesPublicadosCon(supabase, new Date())).toBeNull();
  });
});

describe('publicarViajeCon', () => {
  it('inserta el viaje', async () => {
    const { insert, supabase } = cliente();
    expect(await publicarViajeCon(supabase, FILA)).toBe('ok');
    expect(insert).toHaveBeenCalledWith(FILA);
  });

  it('error si el servidor lo rechaza', async () => {
    expect(
      await publicarViajeCon(cliente({ error: true }).supabase, FILA),
    ).toBe('error');
  });
});

describe('retirarViajeCon', () => {
  it('borra el viaje que nadie reservó', async () => {
    const { borrar, supabase } = cliente();
    expect(await retirarViajeCon(supabase, 'via_x', false)).toBe(true);
    expect(borrar).toHaveBeenCalled();
  });

  it('cancela el viaje que ya tiene pasajeros', async () => {
    const { actualizar, borrar, supabase } = cliente();
    expect(await retirarViajeCon(supabase, 'via_x', true)).toBe(true);
    expect(actualizar).toHaveBeenCalled();
    expect(borrar).not.toHaveBeenCalled();
  });
});
