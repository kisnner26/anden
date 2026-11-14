import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { CLAVE_CONSEJOS_VISTOS, CLAVE_MASCOTA } from './mascota';
import { ProveedorMascota } from './ProveedorMascota';
import { useMascota } from './useMascota';

function envoltura({ children }: { children: ReactNode }) {
  return <ProveedorMascota>{children}</ProveedorMascota>;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ProveedorMascota', () => {
  it('arranca apagada', async () => {
    const { result } = await renderHook(() => useMascota(), {
      wrapper: envoltura,
    });
    await waitFor(() => expect(result.current.activa).toBe(false));
  });

  it('al activarla se recuerda', async () => {
    const { result } = await renderHook(() => useMascota(), {
      wrapper: envoltura,
    });
    await act(async () => {
      await result.current.cambiar(true);
    });
    expect(result.current.activa).toBe(true);
    expect(await AsyncStorage.getItem(CLAVE_MASCOTA)).toBe('1');
  });

  it('recuerda que ya estaba activa al volver a abrir', async () => {
    await AsyncStorage.setItem(CLAVE_MASCOTA, '1');
    const { result } = await renderHook(() => useMascota(), {
      wrapper: envoltura,
    });
    await waitFor(() => expect(result.current.activa).toBe(true));
  });

  it('marca un consejo como visto hoy y lo guarda', async () => {
    const { result } = await renderHook(() => useMascota(), {
      wrapper: envoltura,
    });
    await act(async () => {
      result.current.marcar('calificar');
    });
    expect(Object.keys(result.current.vistos)).toEqual(['calificar']);
    expect(await AsyncStorage.getItem(CLAVE_CONSEJOS_VISTOS)).toContain(
      'calificar',
    );
  });
});
