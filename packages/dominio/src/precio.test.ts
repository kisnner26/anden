import { describe, expect, it } from 'vitest';

import { minutosDelTramo, MULTIPLICADORES_BUS } from './precio';
import type { Ruta } from './tipos';

const ruta: Ruta = {
  id: 'rut_uca_gra',
  origenId: 'ter_uca',
  destinoId: 'ter_gra',
  paradas: [
    { tipo: 'terminal', terminalId: 'ter_uca', minutosDesdeOrigen: 0 },
    { tipo: 'punto', nombre: 'Nandasmo', coordenadas: { lat: 12, lng: -86 }, minutosDesdeOrigen: 35 },
    { tipo: 'terminal', terminalId: 'ter_gra', minutosDesdeOrigen: 55 },
  ],
  distanciaKm: 45,
  duracionMin: 55,
  tarifaBase: 46,
};

describe('minutosDelTramo', () => {
  it('calcula los minutos entre paradas', () => {
    expect(minutosDelTramo(ruta, { desde: 0, hasta: 1 })).toBe(35);
    expect(minutosDelTramo(ruta, { desde: 0, hasta: 2 })).toBe(55);
  });

  it('devuelve nulo si el tramo queda fuera de la ruta', () => {
    expect(minutosDelTramo(ruta, { desde: 0, hasta: 3 })).toBeNull();
  });
});

describe('MULTIPLICADORES_BUS', () => {
  it('aplica la tarifa esperada a cada tipo de bus', () => {
    expect(MULTIPLICADORES_BUS).toEqual({
      ordinario: 1,
      interlocal: 1.2,
      expreso: 1.5,
    });
  });
});
