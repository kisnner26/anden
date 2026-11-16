import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  guardarIAActivada,
  guardarTurista,
  leerIAActivada,
  leerTurista,
} from './ajustesIA';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('IA activada', () => {
  it('por defecto está apagada', async () => {
    expect(await leerIAActivada()).toBe(false);
  });

  it('se enciende y se apaga', async () => {
    await guardarIAActivada(true);
    expect(await leerIAActivada()).toBe(true);
    await guardarIAActivada(false);
    expect(await leerIAActivada()).toBe(false);
  });
});
