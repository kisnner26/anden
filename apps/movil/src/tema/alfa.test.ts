import { describe, expect, it } from '@jest/globals';

import { coloresClaros, coloresOscuros } from './colores';
import { conAlfa, mezclar } from './alfa';

describe('conAlfa', () => {
  it('convierte el blanco con media opacidad', () => {
    expect(conAlfa(coloresOscuros.luzRelieve, 0.5)).toBe(
      'rgba(255, 255, 255, 0.5)',
    );
  });

  it('convierte el negro opaco', () => {
    expect(conAlfa(coloresOscuros.sombraRelieve, 1)).toBe('rgba(0, 0, 0, 1)');
  });

  it('separa bien los tres canales de un color mezclado', () => {
    expect(conAlfa(coloresClaros.sombraRelieve, 0.2)).toBe(
      'rgba(125, 105, 65, 0.2)',
    );
  });
});

describe('mezclar', () => {
  const oscuro = coloresOscuros.fondo;
  const claro = coloresClaros.fondo;

  it('con peso 0 da el primer color y con 1 el segundo', () => {
    expect(mezclar(oscuro, claro, 0)).toBe(oscuro.toLowerCase());
    expect(mezclar(oscuro, claro, 1)).toBe(claro.toLowerCase());
  });

  it('a la mitad cada canal queda entre los dos colores', () => {
    const medio = mezclar(oscuro, claro, 0.5);
    for (const desde of [1, 3, 5]) {
      const a = parseInt(oscuro.slice(desde, desde + 2), 16);
      const b = parseInt(claro.slice(desde, desde + 2), 16);
      const m = parseInt(medio.slice(desde, desde + 2), 16);
      expect(m).toBeGreaterThanOrEqual(Math.min(a, b));
      expect(m).toBeLessThanOrEqual(Math.max(a, b));
    }
  });

  it('siempre devuelve un color opaco de seis dígitos', () => {
    expect(mezclar(coloresOscuros.ambar, oscuro, 0.3)).toMatch(
      /^#[0-9a-f]{6}$/,
    );
  });
});
