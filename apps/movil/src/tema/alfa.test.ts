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
  it('con peso 0 da el primer color y con 1 el segundo', () => {
    expect(mezclar('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mezclar('#000000', '#ffffff', 1)).toBe('#ffffff');
  });

  it('a la mitad da el punto medio', () => {
    expect(mezclar('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  it('siempre devuelve un color opaco de seis dígitos', () => {
    expect(mezclar('#FFB21E', '#121210', 0.3)).toMatch(/^#[0-9a-f]{6}$/);
  });
});
