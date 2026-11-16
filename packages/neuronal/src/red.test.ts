import { describe, expect, it } from 'vitest';

import { avanzar, contarParametros, crearRed, predecir, softmax } from './red';

describe('softmax', () => {
  it('las probabilidades suman uno', () => {
    const p = softmax(new Float32Array([1, 2, 3]));
    expect(p[0]! + p[1]! + p[2]!).toBeCloseTo(1, 6);
  });

  it('el valor más alto tiene la probabilidad más alta', () => {
    const p = softmax(new Float32Array([1, 5, 2]));
    expect(p[1]!).toBeGreaterThan(p[0]!);
    expect(p[1]!).toBeGreaterThan(p[2]!);
  });

  it('no se desborda con números muy grandes', () => {
    const p = softmax(new Float32Array([1000, 1001]));
    expect(Number.isFinite(p[0]!)).toBe(true);
    expect(p[0]! + p[1]!).toBeCloseTo(1, 6);
  });
});

describe('crearRed', () => {
  it('arma una capa por cada salto de tamaño', () => {
    const red = crearRed(4, [6, 5], 3);
    expect(red.capas.map((c) => [c.entradas, c.salidas])).toEqual([
      [4, 6],
      [6, 5],
      [5, 3],
    ]);
  });

  it('con la misma semilla crea los mismos pesos', () => {
    const a = crearRed(4, [6], 3, 9);
    const b = crearRed(4, [6], 3, 9);
    expect(Array.from(a.capas[0]!.pesos)).toEqual(
      Array.from(b.capas[0]!.pesos),
    );
  });

  it('con otra semilla crea otros pesos', () => {
    const a = crearRed(4, [6], 3, 1);
    const b = crearRed(4, [6], 3, 2);
    expect(Array.from(a.capas[0]!.pesos)).not.toEqual(
      Array.from(b.capas[0]!.pesos),
    );
  });

  it('los sesgos empiezan en cero', () => {
    const red = crearRed(4, [6], 3);
    expect(Array.from(red.capas[0]!.sesgos).every((s) => s === 0)).toBe(true);
  });
});

describe('contarParametros', () => {
  it('cuenta los pesos y los sesgos de todas las capas', () => {
    expect(contarParametros(crearRed(4, [6], 3))).toBe(4 * 6 + 6 + 6 * 3 + 3);
  });
});

describe('predecir', () => {
  it('devuelve una probabilidad por clase que suma uno', () => {
    const p = predecir(crearRed(4, [6], 3), new Float32Array([1, 0, 0, 1]));
    expect(p).toHaveLength(3);
    expect(p[0]! + p[1]! + p[2]!).toBeCloseTo(1, 5);
  });
});
