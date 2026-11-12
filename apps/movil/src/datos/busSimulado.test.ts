import { describe, expect, it } from '@jest/globals';

import {
  interpolar,
  minutosRestantes,
  progresoSimulado,
  regionQueEncierra,
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
