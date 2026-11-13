import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import { crearAbordajeSupabase } from './abordajeSupabase';
import { extensionDeFoto } from './solicitudSupabase';
import { crearTransmisionSupabase } from './transmisionSupabase';

type Fila = Record<string, unknown>;

function clienteFalso(inicial: Record<string, Fila[]> = {}) {
  const tablas = structuredClone(inicial);
  const claves: Record<string, string> = {
    abordajes: 'boleto_id',
    transmisiones: 'viaje_id',
  };
  const escritas: { fila: Fila; tabla: string }[] = [];
  const cliente = {
    from: (tabla: string) => ({
      delete: () => ({
        eq: async (columna: string, valor: unknown) => {
          tablas[tabla] = (tablas[tabla] ?? []).filter(
            (fila) => fila[columna] !== valor,
          );
          return { error: null };
        },
      }),
      select: async () => ({ data: tablas[tabla] ?? [], error: null }),
      upsert: async (fila: Fila) => {
        escritas.push({ fila, tabla });
        const clave = claves[tabla] as string;
        tablas[tabla] = [
          ...(tablas[tabla] ?? []).filter((f) => f[clave] !== fila[clave]),
          fila,
        ];
        return { error: null };
      },
    }),
  };
  return { cliente: cliente as unknown as SupabaseClient, escritas, tablas };
}

const vaciar = () => new Promise((resolver) => setTimeout(resolver, 0));

describe('transmisión con Supabase', () => {
  it('iniciar y publicar suben la fila del viaje', async () => {
    const { cliente, escritas } = clienteFalso();
    const servicio = crearTransmisionSupabase(cliente);
    servicio.iniciar('v1', 'cho_2');
    servicio.publicar('v1', {
      lat: 12.4,
      lng: -85.6,
      registradaEn: '2026-11-13T15:00:00.000Z',
      velocidadMs: 9,
    });
    await vaciar();
    expect(escritas).toHaveLength(2);
    expect(escritas[1]?.fila).toMatchObject({
      chofer_id: 'cho_2',
      lat: 12.4,
      viaje_id: 'v1',
    });
    expect(servicio.ultima('v1')?.lat).toBe(12.4);
  });

  it('detener quita la fila y el viaje deja de estar activo', async () => {
    const { cliente, tablas } = clienteFalso();
    const servicio = crearTransmisionSupabase(cliente);
    servicio.iniciar('v1', 'cho_2');
    await vaciar();
    servicio.detener('v1');
    await vaciar();
    expect(tablas.transmisiones).toEqual([]);
    expect(servicio.activos()).toEqual([]);
  });

  it('al escuchar trae los buses de otros conductores', async () => {
    const { cliente } = clienteFalso({
      transmisiones: [
        {
          chofer_id: 'cho_3',
          lat: 12.5,
          lng: -85.7,
          registrada_en: '2026-11-13T15:01:00.000Z',
          velocidad_ms: 7,
          viaje_id: 'v9',
        },
      ],
    });
    const servicio = crearTransmisionSupabase(cliente, undefined, 60000);
    const dejar = servicio.suscribir(() => undefined);
    await vaciar();
    await vaciar();
    expect(servicio.activos()).toEqual(['v9']);
    expect(servicio.ultima('v9')?.lng).toBe(-85.7);
    dejar();
  });

  it('un bus remoto que desaparece del servidor deja de estar activo', async () => {
    jest.useFakeTimers();
    const { cliente, tablas } = clienteFalso({
      transmisiones: [
        {
          chofer_id: 'cho_3',
          lat: 1,
          lng: 1,
          registrada_en: '2026-11-13T15:01:00.000Z',
          velocidad_ms: null,
          viaje_id: 'v9',
        },
      ],
    });
    const servicio = crearTransmisionSupabase(cliente, undefined, 1000);
    const dejar = servicio.suscribir(() => undefined);
    await jest.advanceTimersByTimeAsync(10);
    expect(servicio.activos()).toEqual(['v9']);
    tablas.transmisiones = [];
    await jest.advanceTimersByTimeAsync(1100);
    expect(servicio.activos()).toEqual([]);
    dejar();
    jest.useRealTimers();
  });
});

describe('abordaje con Supabase', () => {
  it('marca y desmarca al alternar, con el chofer que lo marcó', async () => {
    const { cliente, escritas } = clienteFalso();
    const servicio = crearAbordajeSupabase(cliente, async () => 'cho_2');
    const ahora = new Date('2026-11-13T15:00:00.000Z');
    const marcado = await servicio.alternar('bol_1', ahora);
    expect(marcado.bol_1).toBe(ahora.toISOString());
    expect(escritas[0]?.fila).toMatchObject({ marcado_por: 'cho_2' });
    expect(await servicio.alternar('bol_1')).toEqual({});
  });
});

describe('extensionDeFoto', () => {
  it('conserva la extensión y usa jpg si no hay', () => {
    expect(extensionDeFoto('fotos/abc.PNG')).toBe('png');
    expect(extensionDeFoto('fotos/abc')).toBe('jpg');
  });
});
