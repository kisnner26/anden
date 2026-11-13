import { describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import { nuevaEncomienda } from '@/datos/encomiendas';

import { crearEncomiendasSupabase } from './encomiendasSupabase';

const ENC = nuevaEncomienda({
  choferId: 'cho_1',
  descripcion: 'caja chica',
  destinatario: 'Luis',
  destino: 'Boaco',
  origen: 'Managua',
  remitente: 'Ana',
  tamano: 'pequeno',
  telefonoDestinatario: '88881234',
  viajeId: 'via_x',
});

function cliente(opciones: { error?: boolean; filas?: unknown[] } = {}) {
  const error = opciones.error ? new Error('x') : null;
  const insert = jest.fn<(f: unknown) => Promise<{ error: Error | null }>>(
    async () => ({ error }),
  );
  const actualizar = jest.fn<(f: unknown) => unknown>(() => ({
    eq: async () => ({ error }),
  }));
  const supabase = {
    from: () => ({
      insert,
      select: () => ({
        order: async () => ({
          data: opciones.error ? null : (opciones.filas ?? []),
          error,
        }),
      }),
      update: actualizar,
    }),
  } as unknown as SupabaseClient;
  return { actualizar, insert, supabase };
}

describe('encomiendasSupabase', () => {
  it('guarda la solicitud con su viaje y su chofer', async () => {
    const { insert, supabase } = cliente();
    expect(await crearEncomiendasSupabase(supabase).guardar(ENC)).toBe(true);
    expect(insert.mock.calls[0]?.[0]).toMatchObject({
      chofer_id: 'cho_1',
      estado: 'solicitada',
      id: ENC.id,
      viaje_id: 'via_x',
    });
  });

  it('el estado y el motivo de la fila mandan sobre el contenido', async () => {
    const { supabase } = cliente({
      filas: [
        {
          chofer_id: 'cho_1',
          contenido: ENC,
          estado: 'rechazada',
          id: ENC.id,
          motivo: 'No hay espacio',
          viaje_id: 'via_x',
        },
      ],
    });
    const lista = await crearEncomiendasSupabase(supabase).listar();
    expect(lista?.[0]).toMatchObject({
      estado: 'rechazada',
      motivoRechazo: 'No hay espacio',
    });
  });

  it('nulo si el servidor falla, para no borrar lo que ya se veía', async () => {
    const { supabase } = cliente({ error: true });
    expect(await crearEncomiendasSupabase(supabase).listar()).toBeNull();
    expect(await crearEncomiendasSupabase(supabase).guardar(ENC)).toBe(false);
  });

  it('actualiza el estado', async () => {
    const { actualizar, supabase } = cliente();
    const ok = await crearEncomiendasSupabase(supabase).actualizar({
      ...ENC,
      estado: 'aceptada',
    });
    expect(ok).toBe(true);
    expect(actualizar.mock.calls[0]?.[0]).toMatchObject({ estado: 'aceptada' });
  });
});
