import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  leerViajesPublicadosCon,
  publicarViajeCon,
  retirarViajeCon,
  type FilaViaje,
} from './viajesSupabase';

const FILA: FilaViaje = {
  punto_encuentro: '764M4PPX+HF',
  chofer_id: 'cho_1',
  estado: 'programado',
  id: 'via_x',
  placa: 'M 1-2',
  ruta_id: 'rut_may_boa',
  salida: '2026-11-14T15:00:00.000Z',
  servicio: 'ordinario',
};

function cliente(opciones: { borrarFalla?: boolean; error?: boolean } = {}) {
  const error = opciones.error ? new Error('x') : null;
  const insert = jest.fn<(fila: unknown) => Promise<{ error: Error | null }>>(
    async () => ({ error }),
  );
  const actualizar = jest.fn(async () => ({ error }));
  const borrar = jest.fn(async () => ({
    error: opciones.borrarFalla ? new Error('no se puede borrar') : error,
  }));
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

describe('leerViajesPublicadosCon sin las columnas de buscar pasajeros', () => {
  it('reintenta sin ellas y sigue funcionando', async () => {
    const pedidos: string[] = [];
    const cadena = (data: unknown[], error: Error | null) => {
      const resultado = { data: error ? null : data, error };
      const c: Record<string, unknown> = {
        eq: () => c,
        gte: () => c,
        limit: async () => resultado,
        neq: () => c,
        not: () => c,
        order: async () => resultado,
      };
      return c;
    };
    const supabase = {
      from: (tabla: string) =>
        tabla === 'viajes'
          ? {
              select: (campos: string) => {
                pedidos.push(campos);
                return campos.includes('busca_hasta')
                  ? cadena([], new Error('columna'))
                  : cadena([FILA], null);
              },
            }
          : { select: async () => ({ data: [], error: null }) },
      rpc: async () => ({ data: [], error: null }),
    } as unknown as SupabaseClient;
    const lectura = await leerViajesPublicadosCon(supabase, new Date());
    expect(lectura?.viajes).toHaveLength(1);
    expect(pedidos.some((c) => c.includes('busca_hasta'))).toBe(true);
  });
});

describe('retirarViajeCon', () => {
  it('borra el viaje que nadie reservó', async () => {
    const { borrar, supabase } = cliente();
    expect(await retirarViajeCon(supabase, 'via_x', false)).toBe(true);
    expect(borrar).toHaveBeenCalled();
  });

  it('si no se puede borrar lo cancela para que nadie lo vea disponible', async () => {
    const { actualizar, borrar, supabase } = cliente({ borrarFalla: true });
    expect(await retirarViajeCon(supabase, 'via_x', false)).toBe(true);
    expect(borrar).toHaveBeenCalled();
    expect(actualizar).toHaveBeenCalledTimes(1);
  });

  it('cancela con el motivo cuando se da', async () => {
    const { actualizar, supabase } = cliente();
    expect(await retirarViajeCon(supabase, 'via_x', true, 'averia')).toBe(true);
    expect(actualizar).toHaveBeenCalledTimes(1);
  });

  it('cancela el viaje que ya tiene pasajeros', async () => {
    const { actualizar, borrar, supabase } = cliente();
    expect(await retirarViajeCon(supabase, 'via_x', true)).toBe(true);
    expect(actualizar).toHaveBeenCalled();
    expect(borrar).not.toHaveBeenCalled();
  });
});
