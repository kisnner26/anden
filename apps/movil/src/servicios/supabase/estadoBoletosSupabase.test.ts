import { describe, expect, it } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

import { leerEstadoDeBoletosCon } from './estadoBoletosSupabase';

function clienteCon(
  abordajes: { data: unknown; error: unknown },
  pagos: { data: unknown; error: unknown },
) {
  return {
    from: (tabla: string) => ({
      select: () => ({
        in: async () => (tabla === 'abordajes' ? abordajes : pagos),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe('leerEstadoDeBoletosCon', () => {
  it('junta quiénes subieron y quiénes pagaron', async () => {
    const r = await leerEstadoDeBoletosCon(
      clienteCon(
        { data: [{ boleto_id: 'bol_1' }], error: null },
        {
          data: [
            { boleto_id: 'bol_1', estado: 'pagado_efectivo' },
            { boleto_id: 'bol_2', estado: 'pendiente' },
          ],
          error: null,
        },
      ),
      ['bol_1', 'bol_2'],
    );
    expect(r).toEqual({ abordados: ['bol_1'], pagados: ['bol_1'] });
  });

  it('sin boletos no pregunta nada', async () => {
    expect(
      await leerEstadoDeBoletosCon(
        clienteCon({ data: [], error: null }, { data: [], error: null }),
        [],
      ),
    ).toEqual({ abordados: [], pagados: [] });
  });

  it('si una tabla no deja leer, la otra sigue sirviendo', async () => {
    const r = await leerEstadoDeBoletosCon(
      clienteCon(
        { data: [{ boleto_id: 'bol_1' }], error: null },
        { data: null, error: { code: '42501' } },
      ),
      ['bol_1'],
    );
    expect(r).toEqual({ abordados: ['bol_1'], pagados: [] });
  });

  it('si fallan las dos no hay respuesta', async () => {
    const r = await leerEstadoDeBoletosCon(
      clienteCon(
        { data: null, error: { code: 'x' } },
        { data: null, error: { code: 'y' } },
      ),
      ['bol_1'],
    );
    expect(r).toBeNull();
  });
});
