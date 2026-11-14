import { describe, expect, it } from '@jest/globals';

import {
  distanciaEntreToques,
  NIVELES_DE_ZOOM,
  nivelDespuesDePellizcar,
} from './zoomAsientos';

describe('distanciaEntreToques', () => {
  it('mide la distancia entre dos dedos', () => {
    expect(
      distanciaEntreToques([
        { pageX: 0, pageY: 0 },
        { pageX: 3, pageY: 4 },
      ]),
    ).toBe(5);
  });

  it('con menos de dos toques no hay distancia', () => {
    expect(distanciaEntreToques([])).toBe(0);
    expect(distanciaEntreToques([{ pageX: 1, pageY: 1 }])).toBe(0);
  });
});

describe('nivelDespuesDePellizcar', () => {
  it('separar los dedos sube un nivel', () => {
    expect(nivelDespuesDePellizcar(0, 100, 130)).toBe(1);
  });

  it('juntar los dedos baja un nivel', () => {
    expect(nivelDespuesDePellizcar(2, 100, 75)).toBe(1);
  });

  it('un movimiento chico no cambia nada', () => {
    expect(nivelDespuesDePellizcar(1, 100, 110)).toBe(1);
  });

  it('nunca pasa de los extremos', () => {
    const maximo = NIVELES_DE_ZOOM.length - 1;
    expect(nivelDespuesDePellizcar(maximo, 100, 300)).toBe(maximo);
    expect(nivelDespuesDePellizcar(0, 100, 20)).toBe(0);
  });

  it('con datos inválidos deja el nivel como está', () => {
    expect(nivelDespuesDePellizcar(1, 0, 50)).toBe(1);
  });
});
