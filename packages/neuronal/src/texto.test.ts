import { describe, expect, it } from 'vitest';

import { normalizar, palabras, rasgos } from './texto';

describe('normalizar', () => {
  it('quita tildes y pasa a minúsculas', () => {
    expect(normalizar('¿Cuánto CUESTA?')).toBe('cuanto cuesta');
  });
});
