import { describe, expect, it } from '@jest/globals';

import { coloresClaros, coloresOscuros } from './colores';
import { conAlfa } from './alfa';

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
