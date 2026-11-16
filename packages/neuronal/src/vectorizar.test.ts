import { describe, expect, it } from 'vitest';

import { hash, vectorizar } from './vectorizar.ts';

describe('hash', () => {
  it('da siempre el mismo número para el mismo texto', () => {
    expect(hash('boaco')).toBe(hash('boaco'));
  });

  it('da números distintos para textos distintos', () => {
    expect(hash('boaco')).not.toBe(hash('managua'));
  });

  it('nunca es negativo', () => {
    for (const t of ['a', 'bus', 'cuanto cuesta', 'ñandú'])
      expect(hash(t)).toBeGreaterThanOrEqual(0);
  });
});

describe('vectorizar', () => {
  it('tiene el largo pedido', () => {
    expect(vectorizar('bus a boaco', 128)).toHaveLength(128);
  });

  it('queda de norma uno', () => {
    const v = vectorizar('bus a boaco', 256);
    const norma = Math.sqrt(Array.from(v).reduce((s, x) => s + x * x, 0));
    expect(norma).toBeCloseTo(1, 5);
  });

  it('un texto sin palabras da un vector de ceros', () => {
    expect(Array.from(vectorizar('¿?', 64)).every((x) => x === 0)).toBe(true);
  });

  it('el mismo texto da el mismo vector', () => {
    expect(Array.from(vectorizar('mi boleto', 128))).toEqual(
      Array.from(vectorizar('mi boleto', 128)),
    );
  });

  it('las tildes y las mayúsculas no cambian el vector', () => {
    expect(Array.from(vectorizar('¿Cuánto cuesta?', 128))).toEqual(
      Array.from(vectorizar('cuanto cuesta', 128)),
    );
  });

  it('una palabra mal escrita queda cerca de la correcta', () => {
    const a = vectorizar('boaco', 512);
    const b = vectorizar('boacoo', 512);
    const c = vectorizar('encomienda', 512);
    const punto = (x: Float32Array, y: Float32Array) =>
      x.reduce((s, v, i) => s + v * y[i]!, 0);
    expect(punto(a, b)).toBeGreaterThan(punto(a, c));
  });
});
