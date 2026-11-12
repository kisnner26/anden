import { describe, expect, it } from '@jest/globals';

import { FORMAS } from './formas';
import { VARIANTES_BUS, buscarVariante, varianteDeClave } from './variantes';

describe('variantes del bus', () => {
  it('hay al menos 15 con id único', () => {
    expect(VARIANTES_BUS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(VARIANTES_BUS.map((v) => v.id)).size).toBe(
      VARIANTES_BUS.length,
    );
  });

  it('cada una usa una forma que existe', () => {
    for (const variante of VARIANTES_BUS) {
      expect(FORMAS[variante.forma]).toBeDefined();
    }
  });

  it('la misma clave da siempre la misma variante', () => {
    expect(varianteDeClave('bus-12')).toBe(varianteDeClave('bus-12'));
    expect(buscarVariante(varianteDeClave('x')).id).toBe(varianteDeClave('x'));
  });

  it('repartir claves distintas usa varias variantes', () => {
    const usadas = new Set(
      Array.from({ length: 60 }, (_, i) => varianteDeClave(`u${i}`)),
    );
    expect(usadas.size).toBeGreaterThan(8);
  });
});
