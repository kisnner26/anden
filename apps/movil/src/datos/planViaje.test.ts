import { describe, expect, it } from '@jest/globals';

import {
  minutosHastaLaTerminal,
  pasoSiguiente,
  planDelViaje,
} from './planViaje';

const SALIDA = new Date(2026, 10, 15, 14, 0);

describe('minutosHastaLaTerminal', () => {
  it('a unos cuantos kilómetros son unos minutos de calle con tráfico', () => {
    const m = minutosHastaLaTerminal(5000);
    expect(m).toBeGreaterThan(15);
    expect(m).toBeLessThan(30);
  });

  it('nunca menos de tres minutos', () => {
    expect(minutosHastaLaTerminal(10)).toBe(3);
  });
});

describe('planDelViaje', () => {
  it('sin distancia no hay paso de salir de casa', () => {
    const p = planDelViaje(SALIDA, 120, null);
    expect(p.map((x) => x.clave)).toEqual(['anden', 'salida', 'llegada']);
  });

  it('el andén es quince minutos antes de la salida y la llegada suma la duración', () => {
    const p = planDelViaje(SALIDA, 120, null);
    expect(p[0]?.hora.getHours()).toBe(13);
    expect(p[0]?.hora.getMinutes()).toBe(45);
    expect(p[2]?.hora.getHours()).toBe(16);
  });

  it('con la distancia, salir de casa es antes del andén por el camino y el margen', () => {
    const p = planDelViaje(SALIDA, 120, 5000);
    expect(p[0]?.clave).toBe('casa');
    const casa = p[0]!.hora.getTime();
    const anden = p[1]!.hora.getTime();
    expect((anden - casa) / 60_000).toBeGreaterThanOrEqual(25);
  });

  it('lejos de la terminal no se calcula salir de casa', () => {
    const p = planDelViaje(SALIDA, 120, 80_000);
    expect(p.some((x) => x.clave === 'casa')).toBe(false);
  });
});

describe('pasoSiguiente', () => {
  const pasos = planDelViaje(SALIDA, 120, null);

  it('es el primero que todavía no llegó', () => {
    expect(pasoSiguiente(pasos, new Date(2026, 10, 15, 13, 0))).toBe('anden');
    expect(pasoSiguiente(pasos, new Date(2026, 10, 15, 13, 50))).toBe('salida');
  });

  it('nulo cuando ya pasaron todos', () => {
    expect(pasoSiguiente(pasos, new Date(2026, 10, 15, 20, 0))).toBeNull();
  });
});
