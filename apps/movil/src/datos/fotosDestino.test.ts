import { describe, expect, it } from '@jest/globals';

import { fotoDeDestino } from './fotosDestino';

describe('fotoDeDestino', () => {
  it('encuentra la foto sin importar mayúsculas ni espacios', () => {
    expect(fotoDeDestino('Juigalpa')).not.toBeNull();
    expect(fotoDeDestino('  MANAGUA ')).not.toBeNull();
  });

  it('devuelve null para una ciudad sin foto', () => {
    expect(fotoDeDestino('Boaco')).toBeNull();
  });
});
