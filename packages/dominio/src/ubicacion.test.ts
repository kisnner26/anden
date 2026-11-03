import { describe, expect, it } from 'vitest';

import { distanciaKm } from './ubicacion';

describe('distanciaKm', () => {
  it('da cero para la misma coordenada', () => {
    expect(distanciaKm({ lat: 12.1328, lng: -86.2504 }, { lat: 12.1328, lng: -86.2504 })).toBe(0);
  });

  it('calcula una distancia conocida sobre el ecuador', () => {
    expect(distanciaKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(111.195, 3);
  });
});
