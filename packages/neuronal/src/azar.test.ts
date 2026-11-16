import { describe, expect, it } from 'vitest';

import { crearAzar, mezclar, normal } from './azar';

describe('crearAzar', () => {
  it('repite la misma serie con la misma semilla', () => {
    const a = crearAzar(5);
    const b = crearAzar(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('con otra semilla da otra serie', () => {
    expect(crearAzar(1)()).not.toBe(crearAzar(2)());
  });

  it('siempre da números entre cero y uno', () => {
    const azar = crearAzar(3);
    for (let i = 0; i < 1000; i += 1) {
      const x = azar();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('normal', () => {
  it('tiene media cercana a cero y desviación cercana a uno', () => {
    const azar = crearAzar(8);
    const muestras = Array.from({ length: 4000 }, () => normal(azar));
    const media = muestras.reduce((s, x) => s + x, 0) / muestras.length;
    const varianza =
      muestras.reduce((s, x) => s + (x - media) ** 2, 0) / muestras.length;
    expect(Math.abs(media)).toBeLessThan(0.1);
    expect(Math.abs(Math.sqrt(varianza) - 1)).toBeLessThan(0.1);
  });
});

describe('mezclar', () => {
  it('conserva los mismos elementos', () => {
    expect(mezclar([1, 2, 3, 4, 5], crearAzar(1)).sort()).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });
});
