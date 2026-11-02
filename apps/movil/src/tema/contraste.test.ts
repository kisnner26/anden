import { describe, expect, it } from '@jest/globals';

import { coloresClaros, coloresOscuros } from './colores';
import { contraste, luminancia } from './contraste';

const negro = coloresOscuros.sombraRelieve;
const blanco = coloresOscuros.luzRelieve;

describe('contraste', () => {
  it('da 21 entre negro y blanco', () => {
    expect(contraste(negro, blanco)).toBeCloseTo(21, 5);
  });

  it('da 1 entre un color y sí mismo', () => {
    expect(contraste(coloresClaros.fondo, coloresClaros.fondo)).toBeCloseTo(
      1,
      5,
    );
  });

  it('no depende del orden de los colores', () => {
    expect(contraste(coloresClaros.tinta, coloresClaros.fondo)).toBeCloseTo(
      contraste(coloresClaros.fondo, coloresClaros.tinta),
      10,
    );
  });

  it('calcula la luminancia de los extremos', () => {
    expect(luminancia(negro)).toBe(0);
    expect(luminancia(blanco)).toBeCloseTo(1, 5);
  });
});
