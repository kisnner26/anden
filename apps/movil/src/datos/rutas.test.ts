import { TRAZOS } from './trazos';
import { describe, expect, it } from '@jest/globals';

import { crearMuestra } from './muestra';
import { armarRutas } from './rutas';

const AHORA = new Date('2026-11-02T20:00:00.000Z');
const rutas = armarRutas(crearMuestra(AHORA), AHORA);

function de(destino: string) {
  return rutas.find((ruta) => ruta.destino === destino);
}

describe('armarRutas', () => {
  it('trae las dos rutas de la terminal UCA', () => {
    expect(rutas).toHaveLength(2);
  });

  it('trae kilómetros y duración de cada ruta', () => {
    expect(de('Boaco')).toMatchObject({
      distanciaKm: TRAZOS.boa.distanciaKm,
      duracionMin: TRAZOS.boa.duracionMin,
    });
  });

  it('lista los servicios que la recorren con su tarifa de muestra', () => {
    expect(de('Boaco')?.servicios).toEqual([
      { servicio: 'ordinario', tarifa: 70 },
      { servicio: 'expreso', tarifa: 85 },
    ]);
  });

  it('lista los servicios de Juigalpa con su tarifa', () => {
    expect(de('Juigalpa')?.servicios).toEqual([
      { servicio: 'ordinario', tarifa: 110 },
      { servicio: 'expreso', tarifa: 130 },
    ]);
  });

  it('cuenta las salidas pendientes y da la próxima', () => {
    const boaco = de('Boaco');
    expect(boaco?.salidasPendientes).toBe(3);
    expect(boaco?.proximaSalida?.getTime()).toBe(AHORA.getTime() + 20 * 60_000);
  });

  it('deja la tarifa en nulo si no hay tarifario', () => {
    const sinTarifas = armarRutas(
      { ...crearMuestra(AHORA), tarifario: [] },
      AHORA,
    );
    expect(
      sinTarifas.every((ruta) =>
        ruta.servicios.every((s) => s.tarifa === null),
      ),
    ).toBe(true);
  });
});
