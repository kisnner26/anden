import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    setUpdateInterval: jest.fn(),
  },
}));
jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 12.1, longitude: -86.2 },
  })),
  getLastKnownPositionAsync: jest.fn(async () => null),
}));

import { ProveedorBoletos } from './ProveedorBoletos';
import { ProveedorPerfil } from './ProveedorPerfil';
import { CLAVE_SEGURIDAD, ProveedorSeguridad } from './ProveedorSeguridad';
import { ProveedorSesion } from './ProveedorSesion';
import { useSeguridad } from './useSeguridad';

function envoltura({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <ProveedorSesion>
        <ProveedorPerfil>
          <ProveedorBoletos>
            <ProveedorSeguridad>{children}</ProveedorSeguridad>
          </ProveedorBoletos>
        </ProveedorPerfil>
      </ProveedorSesion>
    </SafeAreaProvider>
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ProveedorSeguridad', () => {
  it('arranca activa pero sin vigilar mientras no hay viaje en marcha', async () => {
    const { result } = await renderHook(() => useSeguridad(), {
      wrapper: envoltura,
    });
    await waitFor(() => expect(result.current.activa).toBe(true));
    expect(result.current.vigilando).toBe(false);
  });

  it('se puede apagar y recuerda la decisión', async () => {
    const { result } = await renderHook(() => useSeguridad(), {
      wrapper: envoltura,
    });
    await act(async () => {
      await result.current.cambiar(false);
    });
    expect(result.current.activa).toBe(false);
    expect(await AsyncStorage.getItem(CLAVE_SEGURIDAD)).toBe('0');
  });
});
