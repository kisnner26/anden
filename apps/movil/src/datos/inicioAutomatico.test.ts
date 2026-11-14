import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
  CLAVE_INICIO_AUTOMATICO,
  guardarInicioAutomatico,
  leerInicioAutomatico,
  useInicioAutomatico,
} from './inicioAutomatico';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('inicioAutomatico', () => {
  it('por defecto está apagado', async () => {
    expect(await leerInicioAutomatico()).toBe(false);
  });

  it('guarda y recuerda que se encendió', async () => {
    await guardarInicioAutomatico(true);
    expect(await AsyncStorage.getItem(CLAVE_INICIO_AUTOMATICO)).toBe('1');
    expect(await leerInicioAutomatico()).toBe(true);
  });

  it('el hook lee lo guardado y deja cambiarlo', async () => {
    await guardarInicioAutomatico(true);
    const { result } = await renderHook(() => useInicioAutomatico());
    await waitFor(() => expect(result.current.activo).toBe(true));
    await act(async () => {
      await result.current.cambiar(false);
    });
    expect(result.current.activo).toBe(false);
    expect(await leerInicioAutomatico()).toBe(false);
  });
});
