import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

jest.mock('@/datos/almacenFotos', () => ({
  resolverFoto: (referencia: string) => `file:///docs/${referencia}`,
}));

import {
  leerPerfilChoferCon,
  publicarPerfilChoferCon,
} from './perfilChoferSupabase';

function clienteFalso(
  opciones: {
    errorTabla?: boolean;
    errorSubida?: boolean;
    fila?: unknown;
  } = {},
) {
  const subir = jest.fn<(ruta: string) => Promise<{ error: Error | null }>>(
    async () => ({
      error: opciones.errorSubida ? new Error('x') : null,
    }),
  );
  const upsert = jest.fn<(fila: unknown) => Promise<{ error: Error | null }>>(
    async () => ({
      error: opciones.errorTabla ? new Error('x') : null,
    }),
  );
  const cliente = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: opciones.fila ?? null,
            error: opciones.errorTabla ? new Error('x') : null,
          }),
        }),
      }),
      upsert,
    }),
    storage: {
      from: () => ({
        getPublicUrl: (ruta: string) => ({
          data: { publicUrl: `https://cdn/${ruta}` },
        }),
        upload: subir,
      }),
    },
  } as unknown as SupabaseClient;
  return { cliente, subir, upsert };
}

beforeEach(() => {
  global.fetch = jest.fn(async () => ({
    arrayBuffer: async () => new ArrayBuffer(4),
  })) as unknown as typeof fetch;
});

describe('publicarPerfilChoferCon', () => {
  it('sube la foto local y publica su dirección junto al nombre', async () => {
    const { cliente, subir, upsert } = clienteFalso();
    const url = await publicarPerfilChoferCon(
      cliente,
      'cho_2',
      'Marvin Lanzas',
      'fotos/a.jpg',
    );
    expect(subir).toHaveBeenCalledTimes(1);
    expect(url).toMatch(/^https:\/\/cdn\/cho_2\/foto-\d+\.jpg$/);
    expect(upsert.mock.calls[0]?.[0]).toMatchObject({
      chofer_id: 'cho_2',
      foto_url: url,
      nombre: 'Marvin Lanzas',
    });
  });

  it('no vuelve a subir una foto que ya es una dirección pública', async () => {
    const { cliente, subir } = clienteFalso();
    const url = await publicarPerfilChoferCon(
      cliente,
      'cho_2',
      'Marvin',
      'https://cdn/x.jpg',
    );
    expect(subir).not.toHaveBeenCalled();
    expect(url).toBe('https://cdn/x.jpg');
  });

  it('sin foto publica solo el nombre', async () => {
    const { cliente, upsert } = clienteFalso();
    expect(
      await publicarPerfilChoferCon(cliente, 'cho_2', 'Marvin', null),
    ).toBeNull();
    expect(upsert.mock.calls[0]?.[0]).toMatchObject({ foto_url: null });
  });

  it('devuelve undefined si falla la subida o la tabla', async () => {
    expect(
      await publicarPerfilChoferCon(
        clienteFalso({ errorSubida: true }).cliente,
        'cho_2',
        'M',
        'fotos/a.jpg',
      ),
    ).toBeUndefined();
    expect(
      await publicarPerfilChoferCon(
        clienteFalso({ errorTabla: true }).cliente,
        'cho_2',
        'M',
        null,
      ),
    ).toBeUndefined();
  });
});

describe('leerPerfilChoferCon', () => {
  it('lee el nombre y la foto publicados', async () => {
    const { cliente } = clienteFalso({
      fila: { foto_url: 'https://cdn/x.jpg', nombre: 'Marvin' },
    });
    expect(await leerPerfilChoferCon(cliente, 'cho_2')).toEqual({
      fotoUrl: 'https://cdn/x.jpg',
      nombre: 'Marvin',
    });
  });

  it('nulo si no publicó nada o falla el servidor', async () => {
    expect(
      await leerPerfilChoferCon(clienteFalso().cliente, 'cho_2'),
    ).toBeNull();
    expect(
      await leerPerfilChoferCon(
        clienteFalso({ errorTabla: true }).cliente,
        'cho_2',
      ),
    ).toBeNull();
  });
});
