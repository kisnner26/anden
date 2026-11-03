import { describe, expect, it } from '@jest/globals';

import { crearMuestra } from './muestra';
import { armarRutas } from './rutas';

const AHORA = new Date('2026-11-02T20:00:00.000Z');
const rutas = armarRutas(crearMuestra(AHORA), AHORA);

function de(destino: string) {
  return rutas.find((ruta) => ruta.destino === destino);
}

describe('armarRutas', () => {
  it('trae las seis rutas de la terminal UCA', () => {
    expect(rutas).toHaveLength(6);
  });

  it('trae kilómetros y duración de cada ruta', () => {
    expect(de('Granada')).toMatchObject({ distanciaKm: 45, duracionMin: 55 });
  });

  it('lista los servicios que la recorren con su tarifa de muestra', () => {
    expect(de('Jinotepe')?.servicios).toEqual([
      { servicio: 'ordinario', tarifa: 44 },
      { servicio: 'taxi-interlocal', tarifa: 58 },
    ]);
  });

  it('deja el expreso de León con su tarifa', () => {
    expect(de('León')?.servicios).toEqual([
      { servicio: 'expreso', tarifa: 95 },
    ]);
  });

  it('cuenta las salidas pendientes y da la próxima', () => {
    const masaya = de('Masaya');
    expect(masaya?.salidasPendientes).toBe(1);
    expect(masaya?.proximaSalida?.getTime()).toBe(
      AHORA.getTime() + 65 * 60_000,
    );
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
