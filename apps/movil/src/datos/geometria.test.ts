import { describe, expect, it } from '@jest/globals';

import { diferenciaDeRumbo, distanciaM, rumboGrados } from './geometria';

const MANAGUA = { lat: 12.13413, lng: -86.1933 };
const BOACO = { lat: 12.46781, lng: -85.65786 };

describe('distanciaM', () => {
  it('Managua a Boaco son unos 70 km en línea recta', () => {
    const km = distanciaM(MANAGUA, BOACO) / 1000;
    expect(km).toBeGreaterThan(65);
    expect(km).toBeLessThan(75);
  });

  it('un punto consigo mismo está a cero', () => {
    expect(distanciaM(MANAGUA, MANAGUA)).toBe(0);
  });
});

describe('rumboGrados', () => {
  it('de Managua a Boaco es hacia el noreste', () => {
    const r = rumboGrados(MANAGUA, BOACO);
    expect(r).toBeGreaterThan(30);
    expect(r).toBeLessThan(60);
  });

  it('al norte es 0 y al este es 90', () => {
    expect(rumboGrados({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(
      0,
      5,
    );
    expect(rumboGrados({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(
      90,
      5,
    );
  });

  it('el rumbo de regreso es el opuesto', () => {
    const ida = rumboGrados(MANAGUA, BOACO);
    const vuelta = rumboGrados(BOACO, MANAGUA);
    expect(Math.abs(diferenciaDeRumbo(ida, vuelta))).toBeCloseTo(180, 0);
  });
});

describe('diferenciaDeRumbo', () => {
  it('da el giro más corto y su sentido', () => {
    expect(diferenciaDeRumbo(350, 10)).toBe(20);
    expect(diferenciaDeRumbo(10, 350)).toBe(-20);
    expect(diferenciaDeRumbo(0, 90)).toBe(90);
  });
});
