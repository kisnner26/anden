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

  it('la pérdida de una red sin entrenar es cercana a la del azar', () => {
    const ejemplos: Ejemplo[] = [
      { clase: 0, entrada: new Float32Array([1, 0]) },
      { clase: 1, entrada: new Float32Array([0, 1]) },
    ];
    const { perdida } = evaluar(crearRed(2, [4], 2, 3), ejemplos);
    expect(perdida).toBeGreaterThan(0.3);
    expect(perdida).toBeLessThan(2);
  });

  it('la precisión está entre cero y uno', () => {
    const ejemplos: Ejemplo[] = [
      { clase: 0, entrada: new Float32Array([1, 0]) },
      { clase: 1, entrada: new Float32Array([0, 1]) },
    ];
    const { precision } = evaluar(crearRed(2, [4], 2, 3), ejemplos);
    expect(precision).toBeGreaterThanOrEqual(0);
    expect(precision).toBeLessThanOrEqual(1);
  });
});

describe('matrizDeConfusion', () => {
  it('suma tantos ejemplos como se evaluaron', () => {
    const ejemplos: Ejemplo[] = [0, 1, 1, 0, 1].map((clase) => ({
      clase,
      entrada: new Float32Array([clase, 1 - clase]),
    }));
    const m = matrizDeConfusion(crearRed(2, [4], 2, 3), ejemplos, 2);
    expect(m.flat().reduce((s, x) => s + x, 0)).toBe(5);
  });

  it('cada fila suma los ejemplos reales de su clase', () => {
    const ejemplos: Ejemplo[] = [0, 1, 1, 0, 1].map((clase) => ({
      clase,
      entrada: new Float32Array([clase, 1 - clase]),
    }));
    const m = matrizDeConfusion(crearRed(2, [4], 2, 3), ejemplos, 2);
    expect(m[0]!.reduce((s, x) => s + x, 0)).toBe(2);
    expect(m[1]!.reduce((s, x) => s + x, 0)).toBe(3);
  });
});

describe('precisionPorClase', () => {
  it('divide los aciertos de la diagonal por el total de la fila', () => {
    expect(
      precisionPorClase([
        [3, 1],
        [0, 4],
      ]),
    ).toEqual([0.75, 1]);
  });

  it('una clase sin ejemplos reales da nulo', () => {
    expect(
      precisionPorClase([
        [0, 0],
        [1, 3],
      ]),
    ).toEqual([null, 0.75]);
  });
});
