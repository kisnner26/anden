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
