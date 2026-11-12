import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_ESPERA,
  conEspera,
  esperaDeSalida,
  guardarEsperas,
  leerEsperas,
  salidasLiberadas,
  sinEspera,
} from './espera';
import type { Salida } from './salidas';

function salida(parcial: Partial<Salida>): Salida {
  return {
    anden: 1,
    asientosLibres: 0,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 000000',
    rutaId: 'rut_1',
    salida: new Date(2026, 10, 12, 18, 0),
    servicio: 'ordinario',
    tarifa: 70,
    ventaAbierta: true,
    viajeId: 'via_1',
    ...parcial,
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('espera', () => {
  it('toma el viaje y el destino de la salida', () => {
    const espera = esperaDeSalida(
      salida({}),
      new Date('2026-11-12T10:00:00.000Z'),
    );
    expect(espera).toEqual({
      creadaEn: '2026-11-12T10:00:00.000Z',
      destino: 'Boaco',
      viajeId: 'via_1',
    });
  });

  it('no repite la espera de una misma salida', () => {
    const espera = esperaDeSalida(salida({}));
    expect(conEspera([espera], espera)).toHaveLength(1);
  });

  it('quita una espera por su viaje', () => {
    expect(sinEspera([esperaDeSalida(salida({}))], 'via_1')).toEqual([]);
  });
});

describe('salidasLiberadas', () => {
  const espera = esperaDeSalida(salida({}));

  it('detecta una salida que antes estaba llena y ahora tiene asientos', () => {
    const liberada = salida({ asientosLibres: 2 });
    expect(salidasLiberadas([espera], [liberada])).toEqual([liberada]);
  });

  it('sigue esperando si la salida continúa llena', () => {
    expect(salidasLiberadas([espera], [salida({ asientosLibres: 0 })])).toEqual(
      [],
    );
  });

  it('no avisa de una salida que ya no se puede reservar', () => {
    expect(
      salidasLiberadas(
        [espera],
        [salida({ asientosLibres: 3, ventaAbierta: false })],
      ),
    ).toEqual([]);
  });

  it('ignora esperas de salidas que no existen', () => {
    expect(salidasLiberadas([espera], [])).toEqual([]);
  });
});

describe('guardado', () => {
  it('guarda y lee la lista', async () => {
    const espera = esperaDeSalida(
      salida({}),
      new Date('2026-11-12T10:00:00.000Z'),
    );
    await guardarEsperas([espera]);
    expect(await leerEsperas()).toEqual([espera]);
  });

  it('tolera datos dañados', async () => {
    await AsyncStorage.setItem(CLAVE_ESPERA, 'no es json');
    expect(await leerEsperas()).toEqual([]);
    await AsyncStorage.setItem(
      CLAVE_ESPERA,
      JSON.stringify([{ viajeId: 'x' }]),
    );
    expect(await leerEsperas()).toEqual([]);
  });
});
