import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_RECORDATORIOS,
  conRecordatorio,
  cuandoRecordar,
  guardarRecordatorios,
  leerRecordatorios,
  opcionDisponible,
  sinRecordatorio,
  sinVencidos,
  type RecordatorioSalida,
} from './recordatorios';

const SALIDA = new Date('2026-11-12T18:00:00Z');

function recordatorio(
  parcial: Partial<RecordatorioSalida>,
): RecordatorioSalida {
  return {
    puntoEncuentro: '764M4PPX+HG',
    destino: 'Boaco',
    identificador: 'id_1',
    minutosAntes: 30,
    salida: SALIDA.toISOString(),
    viajeId: 'via_1',
    ...parcial,
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('cuandoRecordar', () => {
  it('resta los minutos a la hora de salida', () => {
    expect(cuandoRecordar(SALIDA, 0, 30).toISOString()).toBe(
      '2026-11-12T17:30:00.000Z',
    );
  });

  it('cuenta desde la salida real si hay atraso', () => {
    expect(cuandoRecordar(SALIDA, 10, 30).toISOString()).toBe(
      '2026-11-12T17:40:00.000Z',
    );
  });
});

describe('opcionDisponible', () => {
  const ahora = new Date('2026-11-12T17:20:00Z');

  it('sirve si el aviso queda en el futuro', () => {
    expect(opcionDisponible(SALIDA, 0, 30, ahora)).toBe(true);
    expect(opcionDisponible(SALIDA, 0, 15, ahora)).toBe(true);
  });

  it('no sirve si el aviso ya habría sonado', () => {
    expect(opcionDisponible(SALIDA, 0, 60, ahora)).toBe(false);
  });
});

describe('la lista de recordatorios', () => {
  it('quita los de salidas que ya pasaron', () => {
    const vieja = recordatorio({
      salida: '2026-11-12T10:00:00Z',
      viajeId: 'a',
    });
    const nueva = recordatorio({ viajeId: 'b' });
    expect(
      sinVencidos([vieja, nueva], new Date('2026-11-12T12:00:00Z')),
    ).toEqual([nueva]);
  });

  it('deja uno por salida: el nuevo reemplaza al anterior', () => {
    const lista = conRecordatorio(
      [recordatorio({ minutosAntes: 15 })],
      recordatorio({ minutosAntes: 60 }),
    );
    expect(lista).toHaveLength(1);
    expect(lista[0]?.minutosAntes).toBe(60);
  });

  it('quita el de una salida', () => {
    expect(sinRecordatorio([recordatorio({})], 'via_1')).toEqual([]);
  });
});

describe('guardar y leer', () => {
  it('guarda y lee la lista', async () => {
    await guardarRecordatorios([recordatorio({})]);
    expect(await leerRecordatorios()).toEqual([recordatorio({})]);
  });

  it('empieza vacía, tolera datos dañados y descarta entradas incompletas', async () => {
    expect(await leerRecordatorios()).toEqual([]);
    await AsyncStorage.setItem(CLAVE_RECORDATORIOS, 'no es json');
    expect(await leerRecordatorios()).toEqual([]);
    await AsyncStorage.setItem(
      CLAVE_RECORDATORIOS,
      JSON.stringify([{ viajeId: 'x' }, recordatorio({})]),
    );
    expect(await leerRecordatorios()).toEqual([recordatorio({})]);
  });
});
