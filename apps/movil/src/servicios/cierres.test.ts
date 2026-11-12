import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  armarCierre,
  CLAVE_CIERRES,
  guardarCierre,
  leerCierres,
  type PasajeroCierre,
} from './cierres';

const PASAJEROS: PasajeroCierre[] = [
  { asiento: 9, boletoId: 'b9', nombre: 'Luis Pérez', precio: 70 },
  { asiento: 8, boletoId: 'b8', nombre: 'Ana Ruiz', precio: 70 },
  { asiento: 12, boletoId: 'b12', nombre: 'Rosa Mena', precio: 85 },
];
const AHORA = new Date('2026-11-12T18:00:00.000Z');

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('armarCierre', () => {
  it('suma lo cobrado, lo que falta y cuántos pagaron', () => {
    const cierre = armarCierre(
      PASAJEROS,
      { b8: { estado: 'pagado_efectivo' }, b12: { estado: 'pagado_efectivo' } },
      'via_1',
      'cho_2',
      AHORA,
    );
    expect(cierre).toMatchObject({
      choferId: 'cho_2',
      cobrado: 155,
      pagados: 2,
      pasajeros: 3,
      pendiente: 70,
      total: 225,
      viajeId: 'via_1',
    });
    expect(cierre.cerradoEn).toBe(AHORA.toISOString());
  });

  it('lista a quienes no pagaron, por asiento', () => {
    const cierre = armarCierre(PASAJEROS, {}, 'via_1', 'cho_2', AHORA);
    expect(cierre.sinPagar.map((p) => p.asiento)).toEqual([8, 9, 12]);
  });

  it('con todos pagados no queda nadie sin pagar', () => {
    const cierre = armarCierre(
      PASAJEROS,
      {
        b8: { estado: 'pagado_efectivo' },
        b9: { estado: 'pagado_efectivo' },
        b12: { estado: 'pagado_efectivo' },
      },
      'via_1',
      'cho_2',
      AHORA,
    );
    expect(cierre.sinPagar).toEqual([]);
    expect(cierre.pendiente).toBe(0);
  });

  it('un viaje sin pasajeros cierra en cero', () => {
    expect(armarCierre([], {}, 'via_1', 'cho_2', AHORA)).toMatchObject({
      cobrado: 0,
      pagados: 0,
      pasajeros: 0,
      total: 0,
    });
  });
});

describe('guardado', () => {
  it('guarda y lee los cierres', async () => {
    const cierre = armarCierre(PASAJEROS, {}, 'via_1', 'cho_2', AHORA);
    await guardarCierre(cierre);
    expect(await leerCierres()).toEqual([cierre]);
  });

  it('cerrar de nuevo el mismo viaje reemplaza el anterior', async () => {
    await guardarCierre(armarCierre(PASAJEROS, {}, 'via_1', 'cho_2', AHORA));
    const segundo = await guardarCierre(
      armarCierre(
        PASAJEROS,
        { b8: { estado: 'pagado_efectivo' } },
        'via_1',
        'cho_2',
        AHORA,
      ),
    );
    expect(segundo).toHaveLength(1);
    expect(segundo[0]?.pagados).toBe(1);
  });

  it('tolera datos dañados', async () => {
    await AsyncStorage.setItem(CLAVE_CIERRES, 'no es json');
    expect(await leerCierres()).toEqual([]);
    await AsyncStorage.setItem(
      CLAVE_CIERRES,
      JSON.stringify([{ viajeId: 'x' }]),
    );
    expect(await leerCierres()).toEqual([]);
  });
});
