import { describe, expect, it } from 'vitest';

import { avanzar, contarParametros, crearRed, predecir, softmax } from './red';

describe('softmax', () => {
  it('las probabilidades suman uno', () => {
    const p = softmax(new Float32Array([1, 2, 3]));
    expect(p[0]! + p[1]! + p[2]!).toBeCloseTo(1, 6);
  });
});
