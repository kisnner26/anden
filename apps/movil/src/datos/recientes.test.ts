import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_RECIENTES,
  agregarReciente,
  borrarRecientes,
  guardarReciente,
  leerRecientes,
} from './recientes';

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('agregarReciente', () => {
  it('pone la búsqueda nueva al principio', () => {
    expect(agregarReciente(['Granada'], 'León')).toEqual(['León', 'Granada']);
  });

  it('no repite una búsqueda, aunque cambien tildes o mayúsculas', () => {
    expect(agregarReciente(['León', 'Granada'], 'leon')).toEqual([
      'leon',
      'Granada',
    ]);
  });

  it('guarda como máximo cinco', () => {
    const seis = agregarReciente(['a1', 'b2', 'c3', 'd4', 'e5'], 'f6');
    expect(seis).toHaveLength(5);
    expect(seis[0]).toBe('f6');
    expect(seis).not.toContain('e5');
  });

  it('ignora los textos de menos de dos letras', () => {
    expect(agregarReciente(['Granada'], ' a ')).toEqual(['Granada']);
  });
});

describe('guardado en el teléfono', () => {
  it('empieza vacío', async () => {
    expect(await leerRecientes()).toEqual([]);
  });

  it('guarda y lee las búsquedas', async () => {
    await guardarReciente('Granada');
    await guardarReciente('León');
    expect(await leerRecientes()).toEqual(['León', 'Granada']);
  });

  it('se recupera de un guardado dañado', async () => {
    await AsyncStorage.setItem(CLAVE_RECIENTES, '{roto');
    expect(await leerRecientes()).toEqual([]);
  });

  it('borra todo', async () => {
    await guardarReciente('Granada');
    await borrarRecientes();
    expect(await leerRecientes()).toEqual([]);
  });
});
