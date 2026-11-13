import { describe, expect, it } from '@jest/globals';

import { colorDeDestino } from './colorDeDestino';

describe('colorDeDestino', () => {
  it('es siempre el mismo para el mismo destino', () => {
    expect(colorDeDestino('Boaco')).toBe(colorDeDestino('Boaco'));
  });

  it('devuelve un color hexadecimal', () => {
    expect(colorDeDestino('Juigalpa')).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
