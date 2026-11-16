import { describe, expect, it } from '@jest/globals';

import { boletoDePrueba } from '@/pruebas/boletos';

import { boletoEnCurso } from './viajeEnCurso';
import type { Salida } from './salidas';

const salida = (viajeId: string, estado: Salida['estado']) =>
  ({ estado, viajeId }) as unknown as Salida;

describe('boletoEnCurso', () => {
  const base = boletoDePrueba(new Date(2026, 10, 16, 13, 0));

  it('elige el boleto cuyo viaje ya salió', () => {
    expect(boletoEnCurso([base], [salida('via_2', 'en-ruta')])?.boleto.id).toBe(
      base.boleto.id,
    );
  });

  it('un viaje que todavía no sale no cuenta', () => {
    expect(boletoEnCurso([base], [salida('via_2', 'programado')])).toBeNull();
    expect(boletoEnCurso([base], [salida('via_2', 'abordando')])).toBeNull();
  });

  it('un viaje que ya llegó no cuenta', () => {
    expect(boletoEnCurso([base], [salida('via_2', 'llego')])).toBeNull();
  });

  it('un boleto cancelado no cuenta aunque el viaje vaya en ruta', () => {
    const cancelado = {
      ...base,
      boleto: { ...base.boleto, estado: 'cancelado' as const },
    };
    expect(boletoEnCurso([cancelado], [salida('via_2', 'en-ruta')])).toBeNull();
  });

  it('un boleto ya usado sí cuenta: la persona va a bordo', () => {
    const usado = {
      ...base,
      boleto: { ...base.boleto, estado: 'usado' as const },
    };
    expect(boletoEnCurso([usado], [salida('via_2', 'en-ruta')])).not.toBeNull();
  });

  it('con dos viajes en ruta elige el de la salida más reciente', () => {
    const otro = boletoDePrueba(new Date(2026, 10, 16, 15, 0), 5, 'ZZZZ9999');
    const otroViaje = {
      ...otro,
      boleto: { ...otro.boleto, viajeId: 'via_5' },
    };
    expect(
      boletoEnCurso(
        [base, otroViaje],
        [salida('via_2', 'en-ruta'), salida('via_5', 'en-ruta')],
      )?.boleto.id,
    ).toBe('bol_ZZZZ9999');
  });

  it('sin boletos no hay viaje en curso', () => {
    expect(boletoEnCurso([], [salida('via_2', 'en-ruta')])).toBeNull();
  });
});
