import { describe, expect, it } from '@jest/globals';

import { boletoDePrueba } from '@/pruebas/boletos';

import { resumirVentas, totalesDeVentas } from './ventasConductor';

const base = new Date(2026, 10, 14, 9, 0);

function boleto(codigo: string, asiento: number, estado = 'vigente') {
  const g = boletoDePrueba(base, asiento, codigo);
  return {
    ...g,
    boleto: { ...g.boleto, estado, viajeId: 'via_1', precio: 66 },
  } as ReturnType<typeof boletoDePrueba>;
}

describe('resumirVentas', () => {
  it('cuenta lo vendido, lo cobrado y lo que falta', () => {
    const boletos = [boleto('AAAA1111', 5), boleto('BBBB2222', 2)];
    const registro = {
      bol_BBBB2222: { estado: 'pagado_efectivo' },
    } as never;
    const v = resumirVentas(boletos, registro, 'via_1');
    expect(v.vendidos).toBe(2);
    expect(v.total).toBe(132);
    expect(v.cobrado).toBe(66);
    expect(v.pendiente).toBe(66);
    expect(v.pagados).toBe(1);
    expect(v.pasajeros.map((p) => p.asiento)).toEqual([2, 5]);
  });

  it('los cancelados no cuentan como vendidos', () => {
    const v = resumirVentas(
      [boleto('AAAA1111', 1), boleto('CCCC3333', 2, 'cancelado')],
      {},
      'via_1',
    );
    expect(v.vendidos).toBe(1);
    expect(v.cancelados).toBe(1);
    expect(v.total).toBe(66);
  });

  it('solo toma los boletos de ese viaje', () => {
    expect(resumirVentas([boleto('AAAA1111', 1)], {}, 'otro').vendidos).toBe(0);
  });
});

describe('totalesDeVentas', () => {
  it('suma varios viajes y cuenta los que vendieron algo', () => {
    const a = resumirVentas([boleto('AAAA1111', 1)], {}, 'via_1');
    const vacio = resumirVentas([], {}, 'via_2');
    const t = totalesDeVentas([a, vacio]);
    expect(t.vendidos).toBe(1);
    expect(t.total).toBe(66);
    expect(t.viajes).toBe(1);
  });
});
