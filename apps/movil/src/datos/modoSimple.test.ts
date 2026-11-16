import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_MODO_SIMPLE,
  guardarModoSimple,
  leerModoSimple,
  useModoSimple,
} from './modoSimple';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('modoSimple', () => {
  it('por defecto está apagado', async () => {
    expect(await leerModoSimple()).toBe(false);
  });

  it('se enciende y se apaga', async () => {
    await guardarModoSimple(true);
    expect(await leerModoSimple()).toBe(true);
    await guardarModoSimple(false);
    expect(await leerModoSimple()).toBe(false);
  });

  it('lee lo que se guardó antes', async () => {
    await AsyncStorage.setItem(CLAVE_MODO_SIMPLE, '1');
    expect(await leerModoSimple()).toBe(true);
  });
});
