import { describe, expect, it } from '@jest/globals';

import {
  aceleracionDinamica,
  evaluarChoque,
  fuerzaG,
  mensajeDeAlerta,
  type MuestraAcelerometro,
  type MuestraVelocidad,
} from './deteccionChoque';

/** muestras cada 10 ms (100 Hz) con el teléfono quieto, es decir 1 g */
function quieto(desde: number, hasta: number): MuestraAcelerometro[] {
  const muestras: MuestraAcelerometro[] = [];
  for (let t = desde; t <= hasta; t += 10)
    muestras.push({ t, x: 0, y: 0, z: 1 });
  return muestras;
}

/** un golpe de `muestras` instantes seguidos con esa aceleración dinámica, empezando en `t` */
function golpe(
  t: number,
  dinamica: number,
  muestras: number,
): MuestraAcelerometro[] {
  return Array.from({ length: muestras }, (_, i) => ({
    t: t + i * 10,
    x: 0,
    y: 0,
    z: 1 + dinamica,
  }));
}

/** el bus yendo a 60 km/h hasta `hasta` y después a la velocidad dada */
function velocidades(
  hasta: number,
  despuesMps: number,
  fin = hasta + 8000,
): MuestraVelocidad[] {
  const lista: MuestraVelocidad[] = [];
  for (let t = 0; t <= hasta; t += 1000) lista.push({ mps: 16.7, t });
  for (let t = hasta + 1000; t <= fin; t += 1000)
    lista.push({ mps: despuesMps, t });
  return lista;
}

describe('fuerzaG y aceleracionDinamica', () => {
  it('suman los tres ejes', () => {
    expect(fuerzaG({ x: 3, y: 4, z: 0 })).toBe(5);
  });

  it('con el teléfono quieto la dinámica es cero', () => {
    expect(aceleracionDinamica({ x: 0, y: 0, z: 1 })).toBe(0);
  });
});

describe('evaluarChoque con GPS', () => {
  it('un golpe sostenido y el bus que se detiene de golpe es un choque', () => {
    const muestras = [
      ...quieto(0, 9990),
      ...golpe(10_000, 5, 8),
      ...quieto(10_080, 14_000),
    ];
    const resultado = evaluarChoque(muestras, velocidades(10_000, 0), 14_000);
    expect(resultado).toEqual({ estado: 'choque', motivo: 'frenada-brusca' });
  });

  it('un frenazo fuerte pero sin golpe no es un choque', () => {
    const frenazo = golpe(10_000, 0.9, 80);
    const muestras = [
      ...quieto(0, 9990),
      ...frenazo,
      ...quieto(10_800, 14_000),
    ];
    expect(evaluarChoque(muestras, velocidades(10_000, 0), 14_000)).toEqual({
      estado: 'ninguno',
    });
  });

  it('un bache (pico corto) no es un choque aunque el bus siga', () => {
    const muestras = [
      ...quieto(0, 9990),
      ...golpe(10_000, 3.5, 1),
      ...quieto(10_010, 14_000),
    ];
    expect(evaluarChoque(muestras, velocidades(10_000, 16.7), 14_000)).toEqual({
      estado: 'ninguno',
    });
  });

  it('un teléfono que se cae dentro del bus en marcha no es un choque', () => {
    const muestras = [
      ...quieto(0, 9990),
      ...golpe(10_000, 12, 1),
      ...quieto(10_010, 14_000),
    ];
    expect(evaluarChoque(muestras, velocidades(10_000, 16.7), 14_000)).toEqual({
      estado: 'ninguno',
    });
  });

  it('un golpe sostenido con el bus detenido no es un choque (por ejemplo, en la terminal)', () => {
    const muestras = [
      ...quieto(0, 9990),
      ...golpe(10_000, 5, 8),
      ...quieto(10_080, 14_000),
    ];
    const parado: MuestraVelocidad[] = Array.from({ length: 15 }, (_, i) => ({
      mps: 0,
      t: i * 1000,
    }));
    expect(evaluarChoque(muestras, parado, 14_000)).toEqual({
      estado: 'ninguno',
    });
  });

  it('un golpe sostenido pero el bus sigue a la misma velocidad no es un choque', () => {
    const muestras = [
      ...quieto(0, 9990),
      ...golpe(10_000, 4, 6),
      ...quieto(10_060, 14_000),
    ];
    expect(evaluarChoque(muestras, velocidades(10_000, 16), 14_000)).toEqual({
      estado: 'ninguno',
    });
  });

  it('mientras el GPS no dice qué hizo el bus después, queda pendiente', () => {
    const muestras = [
      ...quieto(0, 9990),
      ...golpe(10_000, 5, 8),
      ...quieto(10_080, 11_000),
    ];
    const antes = velocidades(10_000, 0, 10_000);
    expect(evaluarChoque(muestras, antes, 11_000)).toEqual({
      estado: 'pendiente',
    });
  });

  it('si el GPS se pierde y el golpe fue muy fuerte, decide por el golpe', () => {
    const muestras = [
      ...quieto(0, 9990),
      ...golpe(10_000, 8, 8),
      ...quieto(10_080, 21_000),
    ];
    const antes = velocidades(10_000, 0, 10_000);
    expect(evaluarChoque(muestras, antes, 21_000)).toEqual({
      estado: 'choque',
      motivo: 'golpe-muy-fuerte',
    });
  });

  it('si el GPS se pierde y el golpe fue moderado, no avisa', () => {
    const muestras = [
      ...quieto(0, 9990),
      ...golpe(10_000, 4, 8),
      ...quieto(10_080, 21_000),
    ];
    const antes = velocidades(10_000, 0, 10_000);
    expect(evaluarChoque(muestras, antes, 21_000)).toEqual({
      estado: 'ninguno',
    });
  });
});

describe('evaluarChoque sin GPS', () => {
  it('un golpe muy fuerte y largo seguido de quietud es un choque', () => {
    const muestras = [
      ...quieto(0, 9990),
      ...golpe(10_000, 8, 6),
      ...quieto(10_060, 12_000),
    ];
    expect(evaluarChoque(muestras, [], 12_000)).toEqual({
      estado: 'choque',
      motivo: 'golpe-muy-fuerte',
    });
  });

  it('un golpe de 4 g no alcanza sin GPS', () => {
    const muestras = [
      ...quieto(0, 9990),
      ...golpe(10_000, 4, 8),
      ...quieto(10_080, 12_000),
    ];
    expect(evaluarChoque(muestras, [], 12_000)).toEqual({ estado: 'ninguno' });
  });

  it('un golpe muy fuerte pero corto (caída) no cuenta', () => {
    const muestras = [
      ...quieto(0, 9990),
      ...golpe(10_000, 15, 1),
      ...quieto(10_010, 12_000),
    ];
    expect(evaluarChoque(muestras, [], 12_000)).toEqual({ estado: 'ninguno' });
  });

  it('si el teléfono sigue moviéndose después del golpe no cuenta', () => {
    const agitado = Array.from({ length: 200 }, (_, i) => ({
      t: 10_100 + i * 10,
      x: 1.2,
      y: 0.3,
      z: i % 2 === 0 ? 2 : 0.2,
    }));
    const muestras = [...quieto(0, 9990), ...golpe(10_000, 8, 6), ...agitado];
    expect(evaluarChoque(muestras, [], 12_200)).toEqual({ estado: 'ninguno' });
  });

  it('antes de ver qué pasó después queda pendiente', () => {
    const muestras = [...quieto(0, 9990), ...golpe(10_000, 8, 6)];
    expect(evaluarChoque(muestras, [], 10_100)).toEqual({
      estado: 'pendiente',
    });
  });

  it('sin muestras no hay nada', () => {
    expect(evaluarChoque([], [], 1000)).toEqual({ estado: 'ninguno' });
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
