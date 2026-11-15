import { describe, expect, it } from '@jest/globals';

import { distanciaLegible, estadoDeLaBrujula } from './brujula';

const AQUI = { lat: 12.13413, lng: -86.1933 };

describe('estadoDeLaBrujula', () => {
  it('con el punto justo al norte y mirando al norte no hay que girar', () => {
    const punto = { lat: AQUI.lat + 0.001, lng: AQUI.lng };
    const e = estadoDeLaBrujula(AQUI, punto, 0);
    expect(Math.abs(e.giro)).toBeLessThan(1);
    expect(e.llego).toBe(false);
    expect(e.distanciaM).toBeGreaterThan(100);
  });

  it('mirando al sur con el punto al norte hay que dar la vuelta', () => {
    const punto = { lat: AQUI.lat + 0.001, lng: AQUI.lng };
    expect(Math.abs(estadoDeLaBrujula(AQUI, punto, 180).giro)).toBeCloseTo(
      180,
      0,
    );
  });

  it('el punto al este y mirando al norte queda a la derecha', () => {
    const punto = { lat: AQUI.lat, lng: AQUI.lng + 0.001 };
    expect(estadoDeLaBrujula(AQUI, punto, 0).giro).toBeCloseTo(90, 0);
  });

  it('a menos de veinte metros ya llegó', () => {
    const punto = { lat: AQUI.lat + 0.00005, lng: AQUI.lng };
    expect(estadoDeLaBrujula(AQUI, punto, 0).llego).toBe(true);
  });
});

describe('distanciaLegible', () => {
  it('en metros redondeados a cinco si es poca', () => {
    expect(distanciaLegible(342)).toBe('340 m');
    expect(distanciaLegible(2)).toBe('5 m');
  });

  it('en kilómetros si pasa de mil', () => {
    expect(distanciaLegible(1520)).toBe('1.5 km');
  });
});
