import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import { boletoDePrueba } from '@/pruebas/boletos';

import {
  cancelarTransferenciaCon,
  crearTransferenciaCon,
  leerEstadoDeTransferenciaCon,
  reclamarTransferenciaCon,
} from './transferenciasSupabase';

function cliente(respuesta: { data: unknown; error: unknown }) {
  const rpc = jest.fn<(...a: unknown[]) => Promise<typeof respuesta>>(
    async () => respuesta,
  );
  return { cliente: { rpc } as unknown as SupabaseClient, rpc };
}

describe('crearTransferenciaCon', () => {
  it('pide la oferta del boleto y devuelve el código', async () => {
    const { cliente: c, rpc } = cliente({ data: 'ABCD2345', error: null });
    expect(await crearTransferenciaCon(c, 'bol_1')).toBe('ABCD2345');
    expect(rpc).toHaveBeenCalledWith('crear_transferencia', {
      p_boleto_id: 'bol_1',
    });
  });

  it('si el servidor falla o devuelve algo raro, nulo', async () => {
    expect(
      await crearTransferenciaCon(
        cliente({ data: null, error: { m: 1 } }).cliente,
        'b',
      ),
    ).toBeNull();
    expect(
      await crearTransferenciaCon(
        cliente({ data: 'xx', error: null }).cliente,
        'b',
      ),
    ).toBeNull();
  });

  it('si la llamada revienta, nulo', async () => {
    const c = {
      rpc: jest.fn(async () => {
        throw new Error('red');
      }),
    } as unknown as SupabaseClient;
    expect(await crearTransferenciaCon(c, 'b')).toBeNull();
  });
});

describe('leerEstadoDeTransferenciaCon', () => {
  it('devuelve el estado y el nombre de quien lo recibió', async () => {
    const { cliente: c } = cliente({
      data: { estado: 'reclamada', para_nombre: 'Luis' },
      error: null,
    });
    expect(await leerEstadoDeTransferenciaCon(c, 'abcd-2345')).toEqual({
      estado: 'reclamada',
      paraNombre: 'Luis',
    });
  });

  it('manda el código ya normalizado', async () => {
    const { cliente: c, rpc } = cliente({
      data: { estado: 'pendiente' },
      error: null,
    });
    await leerEstadoDeTransferenciaCon(c, 'abcd-2345');
    expect(rpc).toHaveBeenCalledWith('estado_transferencia', {
      p_codigo: 'ABCD2345',
    });
  });
});

describe('reclamarTransferenciaCon', () => {
  it('entrega el boleto cuando se canjea', async () => {
    const boleto = boletoDePrueba(new Date(2026, 10, 15, 8, 0));
    const { cliente: c } = cliente({ data: { boleto }, error: null });
    expect(await reclamarTransferenciaCon(c, 'ABCD2345')).toEqual({ boleto });
  });

  it('devuelve el motivo si no se pudo', async () => {
    const { cliente: c } = cliente({ data: { error: 'vencida' }, error: null });
    expect(await reclamarTransferenciaCon(c, 'ABCD2345')).toEqual({
      error: 'vencida',
    });
  });

  it('un error de red es una falla de conexión', async () => {
    const { cliente: c } = cliente({ data: null, error: { m: 1 } });
    expect(await reclamarTransferenciaCon(c, 'ABCD2345')).toEqual({
      error: 'conexion',
    });
  });
});

describe('cancelarTransferenciaCon', () => {
  it('devuelve si salió bien', async () => {
    expect(
      await cancelarTransferenciaCon(
        cliente({ data: null, error: null }).cliente,
        'ABCD2345',
      ),
    ).toBe(true);
    expect(
      await cancelarTransferenciaCon(
        cliente({ data: null, error: { m: 1 } }).cliente,
        'ABCD2345',
      ),
    ).toBe(false);
  });
});
