import { describe, expect, it } from '@jest/globals';

import { pasajerosReservados, viajesDeHoy } from './panelDelChofer';
import type { Salida } from './salidas';

const AHORA = new Date(2026, 10, 16, 14, 0);

function viaje(
  id: string,
  salida: Date,
  estado: Salida['estado'] = 'programado',
) {
  return { estado, salida, viajeId: id } as unknown as Salida;
}

describe('pasajerosReservados', () => {
  it('son los asientos que ya no están libres', () => {
    expect(
      pasajerosReservados({ asientosLibres: 12, asientosTotales: 30 }),
    ).toBe(18);
  });

  it('sin saber los asientos del bus son cero', () => {
    expect(pasajerosReservados({ asientosLibres: 12 })).toBe(0);
  });

  it('nunca da un número negativo', () => {
    expect(
      pasajerosReservados({ asientosLibres: 40, asientosTotales: 30 }),
    ).toBe(0);
  });
});

describe('viajesDeHoy', () => {
  it('deja solo los de hoy y los ordena por hora', () => {
    const lista = viajesDeHoy(
      [
        viaje('b', new Date(2026, 10, 16, 18, 0)),
        viaje('a', new Date(2026, 10, 16, 9, 0)),
        viaje('manana', new Date(2026, 10, 17, 9, 0)),
      ],
      AHORA,
    );
    expect(lista.map((v) => v.viajeId)).toEqual(['a', 'b']);
  });

  it('no cuenta los cancelados', () => {
    const lista = viajesDeHoy(
      [viaje('x', new Date(2026, 10, 16, 9, 0), 'cancelado')],
      AHORA,
    );
    expect(lista).toEqual([]);
  });
});
