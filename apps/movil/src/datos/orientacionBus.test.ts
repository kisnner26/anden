import { describe, expect, it } from '@jest/globals';

import { orientacionBus } from './orientacionBus';

describe('orientacionBus', () => {
  it('hacia el este no se espeja y sin pendiente no se inclina', () => {
    const trazo = [
      { lat: 12, lng: -86 },
      { lat: 12, lng: -85.9 },
      { lat: 12, lng: -85.8 },
    ];
    expect(orientacionBus(trazo, { lat: 12, lng: -85.95 })).toEqual({
      haciaElOeste: false,
      inclinacion: 0,
    });
  });

  it('hacia el oeste se espeja', () => {
    const trazo = [
      { lat: 12, lng: -85.8 },
      { lat: 12, lng: -85.9 },
      { lat: 12, lng: -86 },
    ];
    expect(orientacionBus(trazo, { lat: 12, lng: -85.85 }).haciaElOeste).toBe(
      true,
    );
  });

  it('subiendo hacia el noreste el frente sube y gira en sentido antihorario', () => {
    const trazo = [
      { lat: 12, lng: -86 },
      { lat: 12.05, lng: -85.95 },
      { lat: 12.1, lng: -85.9 },
    ];
    const o = orientacionBus(trazo, { lat: 12.02, lng: -85.98 });
    expect(o.haciaElOeste).toBe(false);
    expect(o.inclinacion).toBeLessThan(0);
  });

  it('subiendo hacia el noroeste el frente sube y gira en sentido horario', () => {
    const trazo = [
      { lat: 12, lng: -85.9 },
      { lat: 12.05, lng: -85.95 },
      { lat: 12.1, lng: -86 },
    ];
    const o = orientacionBus(trazo, { lat: 12.02, lng: -85.92 });
    expect(o.haciaElOeste).toBe(true);
    expect(o.inclinacion).toBeGreaterThan(0);
  });

  it('nunca pasa del límite de inclinación', () => {
    const trazo = [
      { lat: 12, lng: -86 },
      { lat: 13, lng: -85.9999 },
    ];
    expect(
      Math.abs(orientacionBus(trazo, trazo[0]!).inclinacion),
    ).toBeLessThanOrEqual(22);
  });

  it('un trazo sin tramos no gira nada', () => {
    expect(orientacionBus([{ lat: 1, lng: 1 }], { lat: 1, lng: 1 })).toEqual({
      haciaElOeste: false,
      inclinacion: 0,
    });
  });
});
