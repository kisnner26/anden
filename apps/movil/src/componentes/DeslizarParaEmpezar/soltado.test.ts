import { describe, expect, it } from '@jest/globals';

import {
  limitarDesplazamiento,
  marcasCruzadas,
  resolverSoltado,
} from './soltado';

describe('soltado del control deslizante', () => {
  it('limita el desplazamiento al recorrido', () => {
    expect(limitarDesplazamiento(-30, 200)).toBe(0);
    expect(limitarDesplazamiento(80, 200)).toBe(80);
    expect(limitarDesplazamiento(400, 200)).toBe(200);
    expect(limitarDesplazamiento(10, 0)).toBe(0);
  });

  it('completa solo pasado el umbral', () => {
    expect(resolverSoltado(143, 200)).toBe('volver');
    expect(resolverSoltado(144, 200)).toBe('completar');
    expect(resolverSoltado(200, 200)).toBe('completar');
    expect(resolverSoltado(0, 200)).toBe('volver');
  });

  it('un recorrido inválido nunca completa', () => {
    expect(resolverSoltado(50, 0)).toBe('volver');
  });

  it('cuenta las marcas de vibración cruzadas', () => {
    expect(marcasCruzadas(10, 200)).toBe(0);
    expect(marcasCruzadas(50, 200)).toBe(1);
    expect(marcasCruzadas(100, 200)).toBe(2);
    expect(marcasCruzadas(200, 200)).toBe(3);
  });
});
