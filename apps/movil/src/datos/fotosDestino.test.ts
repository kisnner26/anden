import { describe, expect, it } from '@jest/globals';

import {
  cantidadDeFotos,
  enfoqueDeDestino,
  fotoDeDestino,
} from './fotosDestino';

describe('fotosDestino', () => {
  it('cada ciudad tiene varias fotos y las demás ninguna', () => {
    expect(cantidadDeFotos('Boaco')).toBeGreaterThanOrEqual(4);
    expect(cantidadDeFotos('Juigalpa')).toBeGreaterThanOrEqual(4);
    expect(cantidadDeFotos('Managua')).toBeGreaterThanOrEqual(4);
    expect(cantidadDeFotos('León')).toBe(0);
    expect(fotoDeDestino('León')).toBeNull();
  });

  it('compara la ciudad sin importar tildes ni mayúsculas', () => {
    expect(fotoDeDestino('boáco')).toBe(fotoDeDestino('Boaco'));
  });

  it('la misma variante da siempre la misma foto', () => {
    expect(fotoDeDestino('Boaco', 'via_a')).toBe(
      fotoDeDestino('Boaco', 'via_a'),
    );
    expect(fotoDeDestino('Boaco', 2)).toBe(fotoDeDestino('Boaco', 2));
  });

  it('distintas variantes reparten distintas fotos', () => {
    const fotos = new Set([0, 1, 2, 3].map((n) => fotoDeDestino('Managua', n)));
    expect(fotos.size).toBe(4);
  });

  it('cada foto trae su enfoque entre 0 y 100', () => {
    for (let n = 0; n < 5; n += 1) {
      const e = enfoqueDeDestino('Juigalpa', n);
      expect(e).toBeGreaterThanOrEqual(0);
      expect(e).toBeLessThanOrEqual(100);
    }
  });
});

describe('lo que ya se cumplía', () => {
  it('encuentra la foto sin importar mayúsculas ni espacios', () => {
    expect(fotoDeDestino('Juigalpa')).not.toBeNull();
    expect(fotoDeDestino('  MANAGUA ')).not.toBeNull();
    expect(fotoDeDestino('Boaco')).not.toBeNull();
  });

  it('una ciudad sin foto devuelve nulo y se enfoca al centro', () => {
    expect(fotoDeDestino('Granada')).toBeNull();
    expect(enfoqueDeDestino('Granada')).toBe(50);
  });

  it('sin variante la foto de Boaco conserva su enfoque de siempre', () => {
    expect(enfoqueDeDestino('Boaco')).toBe(35);
  });
});
