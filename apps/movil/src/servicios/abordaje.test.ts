import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_ABORDAJE,
  abordo,
  crearAbordajeLocal,
  cuantosAbordaron,
} from './abordaje';

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('abordaje', () => {
  it('sin nada guardado nadie abordó', async () => {
    expect(await crearAbordajeLocal().leer()).toEqual({});
  });

  it('alternar marca y desmarca', async () => {
    const servicio = crearAbordajeLocal();
    const ahora = new Date('2026-11-12T10:00:00Z');
    const marcado = await servicio.alternar('bol_1', ahora);
    expect(abordo(marcado, 'bol_1')).toBe(true);
    expect(marcado.bol_1).toBe(ahora.toISOString());
    expect(abordo(await servicio.alternar('bol_1'), 'bol_1')).toBe(false);
  });

  it('cuenta solo los boletos pedidos', () => {
    const registro = { a: 'x', b: 'y', c: 'z' };
    expect(cuantosAbordaron(registro, ['a', 'c', 'd'])).toBe(2);
  });

  it('un valor roto se lee como vacío', async () => {
    await AsyncStorage.setItem(CLAVE_ABORDAJE, '{no es json');
    expect(await crearAbordajeLocal().leer()).toEqual({});
    await AsyncStorage.setItem(CLAVE_ABORDAJE, '[1,2]');
    expect(await crearAbordajeLocal().leer()).toEqual({});
  });
});
