import { describe, expect, it } from '@jest/globals';

import { enfoqueDeDestino, fotoDeDestino } from './fotosDestino';

describe('fotoDeDestino', () => {
  it('encuentra la foto sin importar mayúsculas ni espacios', () => {
    expect(fotoDeDestino('Juigalpa')).not.toBeNull();
    expect(fotoDeDestino('  MANAGUA ')).not.toBeNull();
    expect(fotoDeDestino('Boaco')).not.toBeNull();
  });

  it('devuelve null para una ciudad sin foto', () => {
    expect(fotoDeDestino('Granada')).toBeNull();
  });
});

describe('enfoqueDeDestino', () => {
  it('conserva la parte importante de cada foto y centra el resto', () => {
    expect(enfoqueDeDestino('Boaco')).toBe(35);
    expect(enfoqueDeDestino('Granada')).toBe(50);
  });
});
