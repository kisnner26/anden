import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import { crearCompartidoCon } from './compartidosSupabase';

const TOKEN = '0123456789abcdef0123456789abcdef';
const DATOS = {
  destino: 'Boaco',
  nombre: 'Ana',
  origen: 'Managua',
  viajeId: 'via_a',
};

function cliente(respuesta: { data: unknown; error: unknown }) {
  const rpc = jest.fn<(...argumentos: unknown[]) => Promise<typeof respuesta>>(
    async () => respuesta,
  );
  return { cliente: { rpc } as unknown as SupabaseClient, rpc };
}

describe('crearCompartidoCon', () => {
  it('pide el enlace al servidor con el viaje, el nombre y la ruta', async () => {
    const { cliente: c, rpc } = cliente({ data: TOKEN, error: null });
    expect(await crearCompartidoCon(c, DATOS)).toBe(TOKEN);
    expect(rpc).toHaveBeenCalledWith('crear_compartido', {
      p_destino: 'Boaco',
      p_horas: 12,
      p_nombre: 'Ana',
      p_origen: 'Managua',
      p_viaje_id: 'via_a',
    });
  });

  it('si el servidor da error devuelve nulo', async () => {
    const { cliente: c } = cliente({ data: null, error: { message: 'x' } });
    expect(await crearCompartidoCon(c, DATOS)).toBeNull();
  });

  it('un código que no tiene la forma esperada se descarta', async () => {
    const { cliente: c } = cliente({ data: 'cualquier cosa', error: null });
    expect(await crearCompartidoCon(c, DATOS)).toBeNull();
  });

  it('si la llamada falla del todo devuelve nulo en vez de romper', async () => {
    const c = {
      rpc: jest.fn(async () => {
        throw new Error('sin red');
      }),
    } as unknown as SupabaseClient;
    expect(await crearCompartidoCon(c, DATOS)).toBeNull();
  });
});
