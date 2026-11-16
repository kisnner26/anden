import { describe, expect, it } from 'vitest';

import {
  evaluar,
  indiceMayor,
  matrizDeConfusion,
  precisionPorClase,
  type Ejemplo,
} from './evaluar';
import { crearRed } from './red';

describe('indiceMayor', () => {
  it('devuelve la posición del valor más alto', () => {
    expect(indiceMayor(new Float32Array([0.1, 0.7, 0.2]))).toBe(1);
  });
});
