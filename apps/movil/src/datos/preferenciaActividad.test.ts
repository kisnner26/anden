import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
  guardarActividadEnVivo,
  leerActividadEnVivo,
  usePreferenciaActividad,
} from './preferenciaActividad';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('preferenciaActividad', () => {
  it('por defecto está encendida', async () => {
    expect(await leerActividadEnVivo()).toBe(true);
  });

  it('recuerda que se apagó', async () => {
    await guardarActividadEnVivo(false);
    expect(await leerActividadEnVivo()).toBe(false);
  });

  it('el hook lee lo guardado y deja cambiarlo', async () => {
    await guardarActividadEnVivo(false);
    const { result } = await renderHook(() => usePreferenciaActividad());
    await waitFor(() => expect(result.current.activa).toBe(false));
    await act(async () => {
      await result.current.cambiar(true);
    });
    expect(result.current.activa).toBe(true);
    expect(await leerActividadEnVivo()).toBe(true);
  });
});
