import { describe, expect, it } from '@jest/globals';

import { rellenar } from './rellenar';

describe('rellenar', () => {
  it('reemplaza cada hueco por su valor', () => {
    expect(
      rellenar('Bus a {destino} en {minutos} min', {
        destino: 'Juigalpa',
        minutos: 20,
      }),
    ).toBe('Bus a Juigalpa en 20 min');
  });

  it('repite un hueco que aparece dos veces', () => {
    expect(rellenar('{a} y {a}', { a: 'x' })).toBe('x y x');
  });

  it('deja el hueco si no hay valor', () => {
    expect(rellenar('Andén {puntoEncuentro}', {})).toBe(
      'Andén {puntoEncuentro}',
    );
  });

  it('también entiende los huecos con doble llave y no deja llaves sueltas', () => {
    expect(
      rellenar('Tenés Plus desde {{fecha}}.', { fecha: 'viernes 13' }),
    ).toBe('Tenés Plus desde viernes 13.');
    expect(rellenar('Paso {{paso}} de {total}', { paso: 1, total: 3 })).toBe(
      'Paso 1 de 3',
    );
  });
});
