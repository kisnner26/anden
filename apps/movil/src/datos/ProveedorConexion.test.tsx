import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

jest.mock('./sincronizarViajes', () => ({
  obtenerUltimaSincronizacion: jest.fn(() => null),
  sincronizarViajes: jest.fn(async () => true),
}));

type Oyente = (estado: {
  isConnected?: boolean;
  isInternetReachable?: boolean;
}) => void;
let oyente: Oyente | null = null;
let estadoInicial: { isConnected?: boolean; isInternetReachable?: boolean } = {
  isConnected: true,
  isInternetReachable: true,
};

jest.mock('expo-network', () => ({
  addNetworkStateListener: jest.fn((funcion: Oyente) => {
    oyente = funcion;
    return { remove: jest.fn() };
  }),
  getNetworkStateAsync: jest.fn(async () => estadoInicial),
}));

import { ProveedorConexion } from './ProveedorConexion';
import { sincronizarViajes } from './sincronizarViajes';
import { useConexion } from './useConexion';

function envoltura({ children }: { children: ReactNode }) {
  return <ProveedorConexion>{children}</ProveedorConexion>;
}

beforeEach(() => {
  jest.clearAllMocks();
  oyente = null;
  estadoInicial = { isConnected: true, isInternetReachable: true };
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ProveedorConexion', () => {
  it('arranca en línea', async () => {
    const { result } = await renderHook(() => useConexion(), {
      wrapper: envoltura,
    });
    expect(result.current.enLinea).toBe(true);
    expect(result.current.recienVuelta).toBe(false);
  });

  it('si se abre sin señal lo sabe de entrada', async () => {
    estadoInicial = { isConnected: false, isInternetReachable: false };
    const { result } = await renderHook(() => useConexion(), {
      wrapper: envoltura,
    });
    await waitFor(() => expect(result.current.enLinea).toBe(false));
  });

  it('al perder la señal pasa a sin conexión y no sincroniza', async () => {
    const { result } = await renderHook(() => useConexion(), {
      wrapper: envoltura,
    });
    await act(async () => {
      oyente?.({ isConnected: false, isInternetReachable: false });
    });
    expect(result.current.enLinea).toBe(false);
    expect(sincronizarViajes).not.toHaveBeenCalled();
  });

  it('al volver la señal se pone al día solo y avisa un momento', async () => {
    const { result } = await renderHook(() => useConexion(), {
      wrapper: envoltura,
    });
    await act(async () => {
      oyente?.({ isConnected: false, isInternetReachable: false });
    });
    await act(async () => {
      oyente?.({ isConnected: true, isInternetReachable: true });
    });
    expect(result.current.enLinea).toBe(true);
    expect(result.current.recienVuelta).toBe(true);
    expect(sincronizarViajes).toHaveBeenCalledTimes(1);
  });
});
