import { describe, expect, it } from '@jest/globals';

import {
  distanciaKm,
  interpolar,
  minutosRestantes,
  progresoSimulado,
  puntoSobreTrazo,
  regionQueEncierra,
  regionQueEncierraTrazo,
} from './busSimulado';

const A = { lat: 12, lng: -86 };
const B = { lat: 13, lng: -85 };

describe('interpolar', () => {
  it('en 0 está en el origen y en 1 en el destino', () => {
    expect(interpolar(A, B, 0)).toEqual(A);
    expect(interpolar(A, B, 1)).toEqual(B);
  });

  it('a la mitad está en el punto medio', () => {
    expect(interpolar(A, B, 0.5)).toEqual({ lat: 12.5, lng: -85.5 });
  });

  it('no se sale del tramo', () => {
    expect(interpolar(A, B, -3)).toEqual(A);
    expect(interpolar(A, B, 7)).toEqual(B);
  });
});

describe('progresoSimulado', () => {
  it('empieza en 0 al inicio de cada ciclo', () => {
    expect(progresoSimulado(new Date(0), 100)).toBe(0);
    expect(progresoSimulado(new Date(100 * 60_000), 100)).toBe(0);
  });

  it('avanza hasta la mitad a mitad del ciclo', () => {
    expect(progresoSimulado(new Date(50 * 60_000), 100)).toBe(0.5);
  });

  it('nunca llega a 1: reinicia en el siguiente ciclo', () => {
    expect(progresoSimulado(new Date(100 * 60_000 - 1), 100)).toBeLessThan(1);
  });

  it('con duración inválida devuelve 0', () => {
    expect(progresoSimulado(new Date(5), 0)).toBe(0);
  });
});

describe('minutosRestantes', () => {
  it('sube al minuto siguiente', () => {
    expect(minutosRestantes(0.5, 100)).toBe(50);
    expect(minutosRestantes(0.505, 100)).toBe(50);
  });

  it('en el destino quedan 0', () => {
    expect(minutosRestantes(1, 100)).toBe(0);
  });
});

describe('regionQueEncierra', () => {
  it('se centra entre los dos puntos con margen', () => {
    const region = regionQueEncierra(A, B);
    expect(region.latitude).toBe(12.5);
    expect(region.longitude).toBe(-85.5);
    expect(region.latitudeDelta).toBeCloseTo(1.4);
  });

  it('mantiene un mínimo si los puntos están juntos', () => {
    expect(regionQueEncierra(A, A).latitudeDelta).toBe(0.02);
  });
});

describe('distanciaKm', () => {
  it('un grado de latitud son unos 111 km', () => {
    expect(
      distanciaKm({ lat: 12, lng: -86 }, { lat: 13, lng: -86 }),
    ).toBeCloseTo(111.32, 1);
  });
});

describe('puntoSobreTrazo', () => {
  const trazo = [
    { lat: 12, lng: -86 },
    { lat: 12, lng: -85.9 },
    { lat: 12.1, lng: -85.9 },
  ];

  it('en 0 y en 1 está en los extremos', () => {
    expect(puntoSobreTrazo(trazo, 0)).toEqual(trazo[0]);
    expect(puntoSobreTrazo(trazo, 1)).toEqual(trazo[2]);
  });

  it('sigue el trazo y no la línea recta entre los extremos', () => {
    const medio = puntoSobreTrazo(trazo, 0.5);
    const recta = interpolar(trazo[0]!, trazo[2]!, 0.5);
    expect(distanciaKm(medio, recta)).toBeGreaterThan(1);
  });

  it('reparte por largo real, no por cantidad de puntos', () => {
    const desigual = [
      { lat: 12, lng: -86 },
      { lat: 12, lng: -85.999 },
      { lat: 12, lng: -85 },
    ];
    expect(puntoSobreTrazo(desigual, 0.5).lng).toBeGreaterThan(-85.6);
  });

  it('un trazo vacío es un error', () => {
    expect(() => puntoSobreTrazo([], 0.5)).toThrow();
  });
});

describe('regionQueEncierraTrazo', () => {
  it('deja ver todos los puntos', () => {
    const region = regionQueEncierraTrazo([
      { lat: 12, lng: -86 },
      { lat: 12.5, lng: -85.2 },
      { lat: 12.1, lng: -85.9 },
    ]);
    expect(region.latitude).toBeCloseTo(12.25, 5);
    expect(region.longitudeDelta).toBeGreaterThanOrEqual(0.8);
  });
});
