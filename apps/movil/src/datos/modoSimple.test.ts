import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';

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

  it('cualquier valor distinto de 1 cuenta como apagado', async () => {
    await AsyncStorage.setItem(CLAVE_MODO_SIMPLE, 'si');
    expect(await leerModoSimple()).toBe(false);
  });
});

describe('useModoSimple', () => {
  it('empieza sin saber y luego lee lo guardado', async () => {
    await AsyncStorage.setItem(CLAVE_MODO_SIMPLE, '1');
    const { result } = await renderHook(() => useModoSimple());
    await waitFor(() => expect(result.current.activo).toBe(true));
  });
});
