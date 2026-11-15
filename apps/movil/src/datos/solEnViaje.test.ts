import { describe, expect, it } from '@jest/globals';

import { asientosDelLado, ladoDelSolEnViaje } from './solEnViaje';

const MANAGUA = { lat: 12.13413, lng: -86.1933 };
const BOACO = { lat: 12.46781, lng: -85.65786 };

describe('ladoDelSolEnViaje', () => {
  it('Managua a Boaco a las 7 de la mañana: el sol pega a la derecha', () => {
    expect(
      ladoDelSolEnViaje(new Date('2026-11-15T13:00:00Z'), MANAGUA, BOACO, 120),
    ).toBe('derecha');
  });

  it('Boaco a Managua en la mañana, es el lado contrario', () => {
    expect(
      ladoDelSolEnViaje(new Date('2026-11-15T13:00:00Z'), BOACO, MANAGUA, 120),
    ).toBe('izquierda');
  });

  it('un viaje de noche no tiene lado', () => {
    expect(
      ladoDelSolEnViaje(new Date('2026-11-16T03:00:00Z'), MANAGUA, BOACO, 120),
    ).toBe('ninguno');
  });
});

describe('asientosDelLado', () => {
  it('en la micro de 15 los del lado izquierdo son las dos primeras columnas', () => {
    const izq = asientosDelLado('micro15', 'izquierda');
    const der = asientosDelLado('micro15', 'derecha');
    expect(izq).toHaveLength(10);
    expect(der).toHaveLength(5);
    expect(izq.some((n) => der.includes(n))).toBe(false);
  });

  it('los del centro de una fila de cinco no son de ningún lado', () => {
    const izq = asientosDelLado('coaster26', 'izquierda');
    const der = asientosDelLado('coaster26', 'derecha');
    expect(izq.length + der.length).toBeLessThan(26);
  });
});
