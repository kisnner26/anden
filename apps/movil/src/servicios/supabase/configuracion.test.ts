import { describe, expect, it } from '@jest/globals';

import { leerUrlDeSeguimiento } from './configuracion';

describe('leerUrlDeSeguimiento', () => {
  it('devuelve la página sin barra final', () => {
    expect(leerUrlDeSeguimiento('https://anden.example/')).toBe(
      'https://anden.example',
    );
  });

  it('sin página o con una dirección sin https no hay enlace web', () => {
    expect(leerUrlDeSeguimiento(undefined)).toBeNull();
    expect(leerUrlDeSeguimiento('  ')).toBeNull();
    expect(leerUrlDeSeguimiento('http://anden.example')).toBeNull();
  });
});
