import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { guardarModoSimple, leerModoSimple } from './modoSimple';

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
});
