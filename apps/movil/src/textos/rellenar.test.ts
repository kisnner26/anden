import { describe, expect, it } from '@jest/globals';

import { rellenar } from './rellenar';

describe('rellenar', () => {
  it('reemplaza cada hueco por su valor', () => {
    expect(
      rellenar('Bus a {destino} en {minutos} min', {
        destino: 'León',
        minutos: 20,
      }),
    ).toBe('Bus a León en 20 min');
  });

  it('repite un hueco que aparece dos veces', () => {
    expect(rellenar('{a} y {a}', { a: 'x' })).toBe('x y x');
  });

  it('deja el hueco si no hay valor', () => {
    expect(rellenar('Andén {anden}', {})).toBe('Andén {anden}');
  });
});
