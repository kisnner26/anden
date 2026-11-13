import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { CierreViaje } from '../cierres';
import { crearCierresSupabase } from './cierresSupabase';
import { crearPagosSupabase } from './pagosSupabase';

/** cliente falso: guarda las filas por tabla y responde a select, upsert y delete */
function clienteFalso(
  inicial: Record<string, Record<string, unknown>[]> = {},
  claves: Record<string, string> = { cierres: 'viaje_id', pagos: 'boleto_id' },
) {
  const tablas = structuredClone(inicial);
  const llamadas = { borrar: jest.fn(), guardar: jest.fn() };
  const cliente = {
    from: (nombre: string) => ({
      delete: () => ({
        eq: async (columna: string, valor: unknown) => {
          llamadas.borrar(nombre, columna, valor);
          tablas[nombre] = (tablas[nombre] ?? []).filter(
            (fila) => fila[columna] !== valor,
          );
          return { error: null };
        },
      }),
      select: async () => ({ data: tablas[nombre] ?? [], error: null }),
      upsert: async (fila: Record<string, unknown>) => {
        llamadas.guardar(nombre, fila);
        const clave = claves[nombre] as string;
        tablas[nombre] = [
          ...(tablas[nombre] ?? []).filter((f) => f[clave] !== fila[clave]),
          fila,
        ];
        return { error: null };
      },
    }),
  };
  return { cliente: cliente as unknown as SupabaseClient, llamadas };
}

const AHORA = new Date('2026-11-13T15:00:00.000Z');

describe('pagos con Supabase', () => {
  it('marca un pago en efectivo y lo devuelve en el registro', async () => {
    const { cliente, llamadas } = clienteFalso();
    const servicio = crearPagosSupabase(cliente);
    const registro = await servicio.marcarPagado('bol_1', 'cho_2', AHORA);
    expect(registro.bol_1).toEqual({
      estado: 'pagado_efectivo',
      marcadoEn: AHORA.toISOString(),
      marcadoPor: 'cho_2',
    });
    expect(llamadas.guardar).toHaveBeenCalledTimes(1);
  });

  it('revertir quita el pago', async () => {
    const { cliente } = clienteFalso();
    const servicio = crearPagosSupabase(cliente);
    await servicio.marcarPagado('bol_1', 'cho_2', AHORA);
    expect(await servicio.revertir('bol_1')).toEqual({});
  });

  it('si el servidor falla la lectura queda vacía', async () => {
    const roto = {
      from: () => ({
        select: async () => ({ data: null, error: new Error('sin permiso') }),
      }),
    } as unknown as SupabaseClient;
    expect(await crearPagosSupabase(roto).leer()).toEqual({});
  });
});

const CIERRE: CierreViaje = {
  cerradoEn: AHORA.toISOString(),
  choferId: 'cho_2',
  cobrado: 132,
  pagados: 2,
  pasajeros: 3,
  pendiente: 66,
  sinPagar: [{ asiento: 4, boletoId: 'bol_3', nombre: 'Luis', precio: 66 }],
  total: 198,
  viajeId: 'v1',
};

describe('cierres con Supabase', () => {
  it('guarda el cierre completo y lo lee', async () => {
    const { cliente, llamadas } = clienteFalso();
    const servicio = crearCierresSupabase(cliente);
    expect(await servicio.guardar(CIERRE)).toEqual([CIERRE]);
    expect(llamadas.guardar).toHaveBeenCalledWith(
      'cierres',
      expect.objectContaining({ cobrado: 132, viaje_id: 'v1' }),
    );
  });

  it('cerrar dos veces el mismo viaje deja solo el último', async () => {
    const { cliente } = clienteFalso();
    const servicio = crearCierresSupabase(cliente);
    await servicio.guardar(CIERRE);
    const lista = await servicio.guardar({ ...CIERRE, cobrado: 198 });
    expect(lista).toHaveLength(1);
    expect(lista[0]?.cobrado).toBe(198);
  });

  it('ignora filas sin el resumen completo', async () => {
    const { cliente } = clienteFalso({
      cierres: [{ contenido: null, viaje_id: 'viejo' }],
    });
    expect(await crearCierresSupabase(cliente).leer()).toEqual([]);
  });
});
