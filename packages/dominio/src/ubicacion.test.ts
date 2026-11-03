import { describe, expect, it } from 'vitest';

import { distanciaKm } from './ubicacion';

describe('distanciaKm', () => {
  it('da cero para la misma coordenada', () => {
    expect(distanciaKm({ lat: 12.1328, lng: -86.2504 }, { lat: 12.1328, lng: -86.2504 })).toBe(0);
  });
});
