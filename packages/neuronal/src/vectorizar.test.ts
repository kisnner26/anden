import { describe, expect, it } from 'vitest';

import { hash, vectorizar } from './vectorizar';

describe('hash', () => {
  it('da siempre el mismo número para el mismo texto', () => {
    expect(hash('boaco')).toBe(hash('boaco'));
  });

  it('da números distintos para textos distintos', () => {
    expect(hash('boaco')).not.toBe(hash('managua'));
  });

  it('nunca es negativo', () => {
    for (const t of ['a', 'bus', 'cuanto cuesta', 'ñandú'])
      expect(hash(t)).toBeGreaterThanOrEqual(0);
  });
});

describe('vectorizar', () => {
  it('tiene el largo pedido', () => {
    expect(vectorizar('bus a boaco', 128)).toHaveLength(128);
  });
});
