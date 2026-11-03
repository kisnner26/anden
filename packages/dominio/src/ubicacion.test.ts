import { describe, expect, it } from 'vitest';

import { distanciaKm, terminalMasCercana } from './ubicacion';

describe('distanciaKm', () => {
  it('da cero para la misma coordenada', () => {
    expect(distanciaKm({ lat: 12.1328, lng: -86.2504 }, { lat: 12.1328, lng: -86.2504 })).toBe(0);
  });

  it('calcula una distancia conocida sobre el ecuador', () => {
    expect(distanciaKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(111.195, 3);
  });

  it('elige la terminal más cercana entre varias', () => {
    const terminal = terminalMasCercana(
      [
        { andenes: 1, ciudad: 'A', codigo: 'AAA', coordenadas: { lat: 12, lng: -86 }, id: 'a', nombre: 'A' },
        { andenes: 1, ciudad: 'B', codigo: 'BBB', coordenadas: { lat: 12.1, lng: -86 }, id: 'b', nombre: 'B' },
      ],
      { lat: 12.08, lng: -86 },
    );
    expect(terminal?.terminal.id).toBe('b');
  });

  it('no inventa una terminal cuando la lista está vacía', () => {
    expect(terminalMasCercana([], { lat: 12, lng: -86 })).toBeNull();
  });
});
