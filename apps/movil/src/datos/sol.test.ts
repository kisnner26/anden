import { describe, expect, it } from '@jest/globals';

import { ladoDelSol, posicionDelSol } from './sol';

// Managua, UTC-6
const MANAGUA = { lat: 12.13413, lng: -86.1933 };

describe('posicionDelSol', () => {
  it('por la mañana sale por el este y está bajo', () => {
    const p = posicionDelSol(new Date('2026-11-15T13:00:00Z'), MANAGUA); // 7:00
    expect(p.azimut).toBeGreaterThan(95);
    expect(p.azimut).toBeLessThan(135);
    expect(p.elevacion).toBeGreaterThan(5);
    expect(p.elevacion).toBeLessThan(35);
  });

  it('por la tarde cae por el oeste', () => {
    const p = posicionDelSol(new Date('2026-11-15T22:30:00Z'), MANAGUA); // 16:30
    expect(p.azimut).toBeGreaterThan(225);
    expect(p.azimut).toBeLessThan(265);
    expect(p.elevacion).toBeGreaterThan(5);
  });

  it('de noche está bajo el horizonte', () => {
    const p = posicionDelSol(new Date('2026-11-16T04:00:00Z'), MANAGUA); // 22:00
    expect(p.elevacion).toBeLessThan(0);
  });

  it('al mediodía está alto', () => {
    const p = posicionDelSol(new Date('2026-11-15T18:00:00Z'), MANAGUA); // 12:00
    expect(p.elevacion).toBeGreaterThan(55);
  });
});

describe('ladoDelSol', () => {
  it('yendo al norte por la mañana el sol pega a la derecha', () => {
    expect(ladoDelSol(new Date('2026-11-15T13:00:00Z'), MANAGUA, 0)).toBe(
      'derecha',
    );
  });

  it('yendo al norte por la tarde el sol pega a la izquierda', () => {
    expect(ladoDelSol(new Date('2026-11-15T22:30:00Z'), MANAGUA, 0)).toBe(
      'izquierda',
    );
  });

  it('yendo al sur por la mañana es al revés: izquierda', () => {
    expect(ladoDelSol(new Date('2026-11-15T13:00:00Z'), MANAGUA, 180)).toBe(
      'izquierda',
    );
  });

  it('de noche no hay lado', () => {
    expect(ladoDelSol(new Date('2026-11-16T04:00:00Z'), MANAGUA, 0)).toBe(
      'ninguno',
    );
  });

  it('con el sol justo de frente no hay lado', () => {
    // por la mañana el sol está al este: yendo al este, de frente
    expect(ladoDelSol(new Date('2026-11-15T13:00:00Z'), MANAGUA, 110)).toBe(
      'ninguno',
    );
  });

  it('al mediodía, con el sol arriba, no hay lado', () => {
    expect(ladoDelSol(new Date('2026-11-15T18:00:00Z'), MANAGUA, 0)).toBe(
      'ninguno',
    );
  });
});
