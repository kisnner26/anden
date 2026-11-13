import { describe, expect, it } from '@jest/globals';

import { distanciaKm } from './busSimulado';
import { trazoEntre } from './trazoCorredor';

describe('trazoEntre', () => {
  it('de Managua a Boaco empieza en Managua y termina en Boaco', () => {
    const trazo = trazoEntre('Managua', 'Boaco');
    expect(trazo).not.toBeNull();
    const { puntos } = trazo!;
    expect(
      distanciaKm(puntos[0]!, { lat: 12.13413, lng: -86.1933 }),
    ).toBeLessThan(2);
    expect(
      distanciaKm(puntos[puntos.length - 1]!, {
        lat: 12.46781,
        lng: -85.65786,
      }),
    ).toBeLessThan(2);
  });

  it('en sentido contrario invierte el trazo', () => {
    const ida = trazoEntre('Managua', 'Juigalpa')!;
    const vuelta = trazoEntre('Juigalpa', 'Managua')!;
    expect(vuelta.puntos[0]).toEqual(ida.puntos[ida.puntos.length - 1]);
    expect(vuelta.distanciaKm).toBe(ida.distanciaKm);
  });

  it('trae distancia y duración de carretera', () => {
    expect(trazoEntre('Managua', 'Boaco')!.distanciaKm).toBeGreaterThan(70);
    expect(trazoEntre('Managua', 'Juigalpa')!.duracionMin).toBeGreaterThan(100);
  });

  it('no inventa un trazo entre ciudades que no tenemos', () => {
    expect(trazoEntre('Boaco', 'Juigalpa')).toBeNull();
    expect(trazoEntre('Managua', 'Granada')).toBeNull();
  });
});
