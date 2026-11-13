import { describe, expect, it } from '@jest/globals';

import {
  esPosibleChoque,
  fuerzaG,
  mensajeDeAlerta,
  type MuestraAcelerometro,
} from './deteccionChoque';

function tramo(desde: number, hasta: number, g: number): MuestraAcelerometro[] {
  const muestras: MuestraAcelerometro[] = [];
  for (let t = desde; t <= hasta; t += 100)
    muestras.push({ t, x: 0, y: 0, z: g });
  return muestras;
}

describe('fuerzaG', () => {
  it('suma los tres ejes', () => {
    expect(fuerzaG({ x: 3, y: 4, z: 0 })).toBe(5);
  });
});

describe('esPosibleChoque', () => {
  it('un golpe fuerte seguido de quietud es un posible choque', () => {
    const muestras = [
      ...tramo(0, 900, 1),
      { t: 1000, x: 5, y: 3, z: 1 },
      ...tramo(1100, 3000, 1),
    ];
    expect(esPosibleChoque(muestras)).toBe(true);
  });

  it('un bache o un frenazo (golpe moderado) no cuenta', () => {
    const muestras = [
      ...tramo(0, 900, 1),
      { t: 1000, x: 2, y: 1, z: 1 },
      ...tramo(1100, 3000, 1),
    ];
    expect(esPosibleChoque(muestras)).toBe(false);
  });

  it('un golpe fuerte y el teléfono siguiendo en movimiento no cuenta', () => {
    const agitado = Array.from({ length: 20 }, (_, i) => ({
      t: 1100 + i * 100,
      x: 1.5,
      y: 0.2,
      z: i % 2 === 0 ? 2 : 0.2,
    }));
    const muestras = [
      ...tramo(0, 900, 1),
      { t: 1000, x: 5, y: 3, z: 1 },
      ...agitado,
    ];
    expect(esPosibleChoque(muestras)).toBe(false);
  });

  it('sin muestras después del golpe todavía no decide', () => {
    expect(
      esPosibleChoque([...tramo(0, 900, 1), { t: 1000, x: 6, y: 0, z: 0 }]),
    ).toBe(false);
    expect(esPosibleChoque([])).toBe(false);
  });
});

describe('mensajeDeAlerta', () => {
  it('lleva el enlace al mapa cuando hay ubicación', () => {
    const texto = mensajeDeAlerta({
      lat: 12.1364,
      lng: -86.2514,
      nombre: 'Ana',
      viajeId: 'via_1',
    });
    expect(texto).toContain('Ana');
    expect(texto).toContain('ll=12.13640,-86.25140');
  });

  it('avisa si no hubo ubicación', () => {
    expect(
      mensajeDeAlerta({ lat: null, lng: null, nombre: 'Ana', viajeId: null }),
    ).toContain('No se pudo obtener la ubicación');
  });
});
