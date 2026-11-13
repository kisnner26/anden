import { describe, expect, it } from 'vitest';

import {
  capacidadDe,
  corredorDe,
  extremosDeRuta,
  fraccionEnCorredor,
  nombreRuta,
  ocupacion,
  puntoEnDibujo,
  TERMINALES,
} from './ruta';

describe('rutas', () => {
  it('entiende el identificador de la ruta', () => {
    expect(extremosDeRuta('rut_may_boa')).toEqual({
      destino: 'boaco',
      origen: 'managua',
    });
    expect(nombreRuta('rut_jui_may')).toBe('Juigalpa → Managua');
    expect(nombreRuta('algo_raro')).toBe('algo_raro');
  });

  it('el corredor es siempre la ciudad que no es Managua', () => {
    expect(corredorDe('rut_may_jui')).toBe('juigalpa');
    expect(corredorDe('rut_boa_may')).toBe('boaco');
    expect(corredorDe('x')).toBeNull();
  });
});

describe('avance en el corredor', () => {
  it('en cada extremo vale 0 y 1 y nunca se sale del rango', () => {
    const m = TERMINALES.managua;
    const b = TERMINALES.boaco;
    expect(fraccionEnCorredor(m.lat, m.lng, 'boaco')).toBeCloseTo(0);
    expect(fraccionEnCorredor(b.lat, b.lng, 'boaco')).toBeCloseTo(1);
    expect(fraccionEnCorredor(b.lat + 5, b.lng + 5, 'boaco')).toBe(1);
    expect(fraccionEnCorredor(m.lat - 5, m.lng - 5, 'boaco')).toBe(0);
  });

  it('a mitad de camino marca la mitad del dibujo', () => {
    const medio = puntoEnDibujo('boaco', 0.5);
    expect(medio.x).toBeCloseTo((150 + 720) / 2);
    expect(medio.y).toBeCloseTo((182 + 74) / 2);
  });
});

describe('ocupación', () => {
  it('usa 26 asientos en el ordinario y 45 en el expreso', () => {
    expect(capacidadDe('ordinario')).toBe(26);
    expect(capacidadDe('expreso')).toBe(45);
    expect(ocupacion(13, 'ordinario')).toMatchObject({
      fraccion: 0.5,
      texto: '13/26',
    });
  });

  it('nunca pasa de lleno', () => {
    expect(ocupacion(60, 'expreso').fraccion).toBe(1);
  });
});
