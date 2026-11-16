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

  it('con un empate se queda con la primera', () => {
    expect(indiceMayor(new Float32Array([0.5, 0.5]))).toBe(0);
  });
});

describe('evaluar', () => {
  it('sin ejemplos da cero', () => {
    expect(evaluar(crearRed(2, [3], 2), [])).toEqual({
      perdida: 0,
      precision: 0,
    });
  });
});
