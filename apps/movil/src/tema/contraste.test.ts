import { describe, expect, it } from '@jest/globals';

import { contraste, luminancia } from './contraste';

describe('contraste', () => {
  it('da 21 entre negro y blanco', () => {
    expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });

  it('da 1 entre un color y sí mismo', () => {
    expect(contraste('#F5F1E8', '#F5F1E8')).toBeCloseTo(1, 5);
  });

  it('no depende del orden de los colores', () => {
    expect(contraste('#17160F', '#F5F1E8')).toBeCloseTo(
      contraste('#F5F1E8', '#17160F'),
      10,
    );
  });

  it('calcula la luminancia de los extremos', () => {
    expect(luminancia('#000000')).toBe(0);
    expect(luminancia('#FFFFFF')).toBeCloseTo(1, 5);
  });
});
