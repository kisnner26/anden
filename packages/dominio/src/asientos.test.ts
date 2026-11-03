import { describe, expect, it } from 'vitest';

import { estadoAsientos, puedeRetener } from './asientos';
import type { Ocupacion, Viaje } from './tipos';

const ahora = new Date('2026-11-02T12:00:00-06:00');
const viaje: Viaje = {
  id: 'via_01',
  rutaId: 'rut_01',
  busId: 'bus_01',
  choferId: 'cho_01',
  salida: '2026-11-02T14:00:00-06:00',
  anden: 1,
  estado: 'programado',
  minutosAtraso: 0,
};
const ocupaciones: Ocupacion[] = [
  {
    viajeId: viaje.id,
    asiento: 1,
    estado: 'retenido',
    duenoId: 'usu_a',
    expira: '2026-11-02T12:10:00-06:00',
  },
  {
    viajeId: viaje.id,
    asiento: 2,
    estado: 'vendido',
    duenoId: 'usu_b',
    boletoId: 'bol_01',
  },
  {
    viajeId: viaje.id,
    asiento: 3,
    estado: 'retenido',
    duenoId: 'usu_c',
    expira: '2026-11-02T11:59:00-06:00',
  },
];

describe('estadoAsientos', () => {
  it('libera retenciones vencidas y conserva ventas', () => {
    expect(estadoAsientos('micro15', ocupaciones, ahora).slice(0, 3)).toEqual([
      { numero: 1, estado: 'retenido', duenoId: 'usu_a' },
      { numero: 2, estado: 'vendido', duenoId: 'usu_b' },
      { numero: 3, estado: 'libre' },
    ]);
  });
});

describe('puedeRetener', () => {
  it('evita el choque de dueños y permite renovar al mismo dueño', () => {
    expect(
      puedeRetener(viaje, 'micro15', ocupaciones, [1], 'usu_b', ahora),
    ).toEqual({ ok: false, error: 'asiento-ocupado' });
    expect(
      puedeRetener(viaje, 'micro15', ocupaciones, [1], 'usu_a', ahora),
    ).toEqual({ ok: true, valor: undefined });
  });

  it('valida límite, existencia, venta cerrada y cancelación', () => {
    expect(puedeRetener(viaje, 'micro15', [], [], 'usu_a', ahora)).toEqual({
      ok: false,
      error: 'sin-asientos',
    });
    expect(
      puedeRetener(viaje, 'micro15', [], [1, 2, 3, 4, 5, 6, 7], 'usu_a', ahora),
    ).toEqual({ ok: false, error: 'maximo-6' });
    expect(puedeRetener(viaje, 'micro15', [], [16], 'usu_a', ahora)).toEqual({
      ok: false,
      error: 'asiento-inexistente',
    });
    expect(
      puedeRetener(
        viaje,
        'micro15',
        [],
        [1],
        'usu_a',
        new Date('2026-11-02T13:45:00-06:00'),
      ),
    ).toEqual({ ok: false, error: 'venta-cerrada' });
    expect(
      puedeRetener(
        { ...viaje, estado: 'cancelado' },
        'micro15',
        [],
        [1],
        'usu_a',
        ahora,
      ),
    ).toEqual({ ok: false, error: 'venta-cerrada' });
  });

  it('no deja retener un asiento vendido aunque sea del mismo dueño', () => {
    const vendido: Ocupacion[] = [
      {
        viajeId: viaje.id,
        asiento: 4,
        estado: 'vendido',
        duenoId: 'usu_a',
        boletoId: 'bol_01',
      },
    ];
    expect(
      puedeRetener(viaje, 'micro15', vendido, [4], 'usu_a', ahora),
    ).toEqual({ ok: false, error: 'asiento-ocupado' });
  });
});
