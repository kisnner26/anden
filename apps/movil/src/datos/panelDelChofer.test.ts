import { describe, expect, it } from '@jest/globals';

import { pasajerosReservados } from './panelDelChofer';

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
