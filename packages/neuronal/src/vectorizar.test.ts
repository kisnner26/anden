import { describe, expect, it } from 'vitest';

import { hash, vectorizar } from './vectorizar';

describe('hash', () => {
  it('da siempre el mismo número para el mismo texto', () => {
    expect(hash('boaco')).toBe(hash('boaco'));
  });

  it('da números distintos para textos distintos', () => {
    expect(hash('boaco')).not.toBe(hash('managua'));
  });
});
