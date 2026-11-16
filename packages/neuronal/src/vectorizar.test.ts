import { describe, expect, it } from 'vitest';

import { hash, vectorizar } from './vectorizar';

describe('hash', () => {
  it('da siempre el mismo número para el mismo texto', () => {
    expect(hash('boaco')).toBe(hash('boaco'));
  });
});
