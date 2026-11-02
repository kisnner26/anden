import { describe, expect, it } from 'vitest';

import {
  minutosDelTramo,
  MULTIPLICADORES_BUS,
  calcularPrecio,
  precioUnitario,
} from './precio';
import type { Ruta } from './tipos';

const ruta: Ruta = {
  id: 'rut_uca_gra',
  origenId: 'ter_uca',
  destinoId: 'ter_gra',
  paradas: [
    { tipo: 'terminal', terminalId: 'ter_uca', minutosDesdeOrigen: 0 },
    {
      tipo: 'punto',
      nombre: 'Nandasmo',
      coordenadas: { lat: 12, lng: -86 },
      minutosDesdeOrigen: 35,
    },
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

describe('precioUnitario', () => {
  it('mantiene la tarifa base en el tramo completo', () => {
    expect(precioUnitario(ruta, { desde: 0, hasta: 2 }, 'ordinario')).toBe(46);
  });

  it('mantiene la tarifa completa aunque las paradas no alcancen la duración', () => {
    const rutaConEscalaIncompleta = {
      ...ruta,
      paradas: [
        ruta.paradas[0]!,
        { ...ruta.paradas[2]!, minutosDesdeOrigen: 50 },
      ],
    };
    expect(
      precioUnitario(
        rutaConEscalaIncompleta,
        { desde: 0, hasta: 1 },
        'ordinario',
      ),
    ).toBe(46);
  });

  it('prorratea por minutos y redondea una sola vez', () => {
    expect(precioUnitario(ruta, { desde: 0, hasta: 1 }, 'interlocal')).toBe(36);
  });
});

describe('calcularPrecio', () => {
  it('cobra solo a los pasajeros que ocupan asiento', () => {
    expect(
      calcularPrecio(ruta, { desde: 0, hasta: 2 }, 'expreso', [
        { nombre: 'Ana Ruiz', esMenorEnBrazos: false },
        { nombre: 'Luis Ruiz', esMenorEnBrazos: true },
        { nombre: 'Marta Ruiz', esMenorEnBrazos: false },
      ]),
    ).toEqual({ ok: true, valor: { unitario: 69, total: 138 } });
  });

  it('rechaza un tramo inválido', () => {
    expect(
      calcularPrecio(ruta, { desde: 1, hasta: 3 }, 'ordinario', [
        { nombre: 'Ana Ruiz', esMenorEnBrazos: false },
      ]),
    ).toEqual({ ok: false, error: 'tramo-invalido' });
  });

  it('rechaza una compra sin pasajeros que pagan', () => {
    expect(
      calcularPrecio(ruta, { desde: 0, hasta: 2 }, 'ordinario', [
        { nombre: 'Luis Ruiz', esMenorEnBrazos: true },
      ]),
    ).toEqual({ ok: false, error: 'sin-pasajeros' });
  });
});
