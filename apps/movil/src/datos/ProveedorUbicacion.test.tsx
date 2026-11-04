import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

jest.mock('./ubicacion', () => ({
  consultarAccesoUbicacion: jest.fn(),
  solicitarAccesoUbicacion: jest.fn(),
}));

import {
  ProveedorUbicacion,
  usePreferenciaUbicacion,
} from './ProveedorUbicacion';
import { CLAVE_UBICACION_AUTOMATICA } from './preferenciaUbicacion';
import {
  consultarAccesoUbicacion,
  solicitarAccesoUbicacion,
} from './ubicacion';

function Envoltura({ children }: PropsWithChildren) {
  return <ProveedorUbicacion>{children}</ProveedorUbicacion>;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  jest
    .mocked(consultarAccesoUbicacion)
    .mockResolvedValue({ estado: 'otorgado' });
  jest
    .mocked(solicitarAccesoUbicacion)
    .mockResolvedValue({ estado: 'otorgado' });
});

it('recupera la preferencia y consulta el permiso sin mostrar diálogo', async () => {
  await AsyncStorage.setItem(CLAVE_UBICACION_AUTOMATICA, '1');

  const { result } = await renderHook(() => usePreferenciaUbicacion(), {
    wrapper: Envoltura,
  });

  await waitFor(() => expect(result.current.activada).toBe(true));
  expect(result.current.estado).toBe('otorgado');
  expect(consultarAccesoUbicacion).toHaveBeenCalledTimes(1);
  expect(solicitarAccesoUbicacion).not.toHaveBeenCalled();
});

it('activa la preferencia y solicita permiso', async () => {
  const { result } = await renderHook(() => usePreferenciaUbicacion(), {
    wrapper: Envoltura,
  });
  await waitFor(() => expect(result.current.estado).toBe('apagada'));

  await act(() => result.current.activar());

  expect(result.current.activada).toBe(true);
  expect(result.current.estado).toBe('otorgado');
  expect(solicitarAccesoUbicacion).toHaveBeenCalledTimes(1);
  expect(await AsyncStorage.getItem(CLAVE_UBICACION_AUTOMATICA)).toBe('1');
});
