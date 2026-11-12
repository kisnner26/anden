import { describe, expect, it } from '@jest/globals';

import { KM_FUERA_DE_RUTA, progresoSobreTrazo } from './progresoViaje';
import { trazoEntre } from './trazoCorredor';

const RECTA = [
  { lat: 12, lng: -86 },
  { lat: 12, lng: -85.9 },
  { lat: 12, lng: -85.8 },
];

describe('progresoSobreTrazo', () => {
  it('en el origen no lleva nada recorrido', () => {
    const progreso = progresoSobreTrazo(RECTA, RECTA[0]!, 100);
    expect(progreso?.porcentaje).toBe(0);
    expect(progreso?.kmRecorridos).toBe(0);
    expect(progreso?.minutosRestantes).toBe(100);
  });

  it('en el destino ya llegó', () => {
    const progreso = progresoSobreTrazo(RECTA, RECTA[2]!, 100);
    expect(progreso?.porcentaje).toBe(100);
    expect(progreso?.kmRestantes).toBe(0);
    expect(progreso?.minutosRestantes).toBe(0);
  });

  it('a la mitad lleva la mitad de los kilómetros y del tiempo', () => {
    const progreso = progresoSobreTrazo(RECTA, RECTA[1]!, 100);
    expect(progreso?.porcentaje).toBe(50);
    expect(progreso?.minutosRestantes).toBe(50);
    expect(progreso?.kmRecorridos).toBeCloseTo(progreso!.kmRestantes, 0);
  });

  it('proyecta una posición apartada del camino sobre el punto más cercano', () => {
    const progreso = progresoSobreTrazo(
      RECTA,
      { lat: 12.005, lng: -85.9 },
      100,
    );
    expect(progreso?.porcentaje).toBe(50);
    expect(progreso?.desvioKm).toBeGreaterThan(0);
    expect(progreso?.fueraDeRuta).toBe(false);
  });

  it('marca fuera de ruta si se aleja más del límite', () => {
    const lejos = { lat: 12 + (KM_FUERA_DE_RUTA + 1) / 111.32, lng: -85.9 };
    expect(progresoSobreTrazo(RECTA, lejos, 100)?.fueraDeRuta).toBe(true);
  });

  it('no calcula con un trazo sin largo', () => {
    expect(progresoSobreTrazo([], RECTA[0]!, 100)).toBeNull();
    expect(progresoSobreTrazo([RECTA[0]!], RECTA[0]!, 100)).toBeNull();
    expect(
      progresoSobreTrazo([RECTA[0]!, RECTA[0]!], RECTA[0]!, 100),
    ).toBeNull();
  });

  it('con la carretera real de Boaco da kilómetros coherentes con el total', () => {
    const trazo = trazoEntre('Managua', 'Boaco')!;
    const medio = trazo.puntos[Math.floor(trazo.puntos.length / 2)]!;
    const progreso = progresoSobreTrazo(
      trazo.puntos,
      medio,
      trazo.duracionMin,
    )!;
    expect(progreso.kmRecorridos + progreso.kmRestantes).toBeCloseTo(
      trazo.distanciaKm,
      0,
    );
    expect(progreso.porcentaje).toBeGreaterThan(20);
    expect(progreso.porcentaje).toBeLessThan(80);
  });
});
