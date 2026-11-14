import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  antiguedadLegible,
  CLAVE_CACHE_VIAJES,
  guardarCacheViajes,
  leerCacheViajes,
} from './cacheViajes';

const PUBLICADOS = {
  choferes: [],
  historial: [],
  ocupacion: [],
  viajes: [
    {
      chofer_id: 'cho_1',
      estado: 'programado',
      id: 'via_a',
      placa: 'M 1',
      punto_encuentro: null,
      ruta_id: 'rut_1',
      salida: '2026-11-15T12:00:00.000Z',
      servicio: 'ordinario' as const,
    },
  ],
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('cache de viajes', () => {
  it('guarda lo que respondió el servidor y lo devuelve con su hora', async () => {
    await guardarCacheViajes(PUBLICADOS, new Date('2026-11-14T10:00:00Z'));
    const cache = await leerCacheViajes();
    expect(cache?.guardadoEn).toBe('2026-11-14T10:00:00.000Z');
    expect(cache?.publicados.viajes[0]?.id).toBe('via_a');
  });

  it('sin nada guardado devuelve nulo', async () => {
    expect(await leerCacheViajes()).toBeNull();
  });

  it('un cache dañado se ignora en vez de romper la app', async () => {
    await AsyncStorage.setItem(CLAVE_CACHE_VIAJES, 'no es json');
    expect(await leerCacheViajes()).toBeNull();
    await AsyncStorage.setItem(
      CLAVE_CACHE_VIAJES,
      JSON.stringify({ guardadoEn: 'ayer', publicados: {} }),
    );
    expect(await leerCacheViajes()).toBeNull();
  });
});

describe('antiguedadLegible', () => {
  const ahora = new Date('2026-11-14T12:00:00Z');
  it.each([
    ['2026-11-14T11:59:40Z', 'hace un momento'],
    ['2026-11-14T11:55:00Z', 'hace 5 min'],
    ['2026-11-14T09:00:00Z', 'hace 3 h'],
    ['2026-11-13T12:00:00Z', 'hace 1 día'],
    ['2026-11-11T12:00:00Z', 'hace 3 días'],
  ])('%s -> %s', (desde, esperado) => {
    expect(antiguedadLegible(new Date(desde), ahora)).toBe(esperado);
  });
});
