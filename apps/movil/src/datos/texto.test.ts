import { describe, expect, it } from '@jest/globals';

import { sinTildes } from './texto';

describe('sinTildes', () => {
  it('quita las tildes', () => {
    expect(sinTildes('León')).toBe('leon');
  });

  it('pasa a minúsculas', () => {
    expect(sinTildes('MANAGUA')).toBe('managua');
  });

  it('conserva la ñ como n', () => {
    expect(sinTildes('Año')).toBe('ano');
  });

  it('deja igual lo que no tiene tildes', () => {
    expect(sinTildes('boaco 12')).toBe('boaco 12');
  });
});
