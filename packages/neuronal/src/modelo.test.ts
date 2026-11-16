import { describe, expect, it } from 'vitest';

import { aModelo, aRed, leerModelo } from './modelo.ts';
import { crearRed, predecir } from './red.ts';

const META = {
  ejemplos: 3,
  entrenadoEn: '2026-11-16T00:00:00.000Z',
  precisionValidacion: 0.9,
};

describe('aModelo y aRed', () => {
  it('guardar y volver a cargar da las mismas respuestas', () => {
    const red = crearRed(4, [5], 3, 2);
    const vuelta = aRed(aModelo(red, ['a', 'b', 'c'], 4, META));
    const x = new Float32Array([0.5, 0, 1, 0.2]);
    const a = predecir(red, x);
    const b = predecir(vuelta, x);
    for (let i = 0; i < 3; i += 1)
      expect(Math.abs(a[i]! - b[i]!)).toBeLessThan(0.01);
  });
});
