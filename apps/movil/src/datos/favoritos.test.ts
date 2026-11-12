import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  alternarFavorito,
  CLAVE_FAVORITOS,
  guardarFavoritos,
  leerFavoritos,
} from './favoritos';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('favoritos', () => {
  it('agrega un corredor que no estaba', () => {
    expect(alternarFavorito(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('quita un corredor que ya estaba', () => {
    expect(alternarFavorito(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('guarda y lee la lista', async () => {
    await guardarFavoritos(['cor_boa_man']);
    expect(await leerFavoritos()).toEqual(['cor_boa_man']);
  });

  it('empieza vacía y tolera datos dañados', async () => {
    expect(await leerFavoritos()).toEqual([]);
    await AsyncStorage.setItem(CLAVE_FAVORITOS, '{no es json');
    expect(await leerFavoritos()).toEqual([]);
    await AsyncStorage.setItem(CLAVE_FAVORITOS, '[1,"a"]');
    expect(await leerFavoritos()).toEqual(['a']);
  });
});
