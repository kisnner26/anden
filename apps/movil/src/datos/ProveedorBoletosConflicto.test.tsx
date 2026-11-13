import AsyncStorage from '@react-native-async-storage/async-storage';
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

jest.mock('@/servicios/supabase/boletosCompartidos', () => ({
  leerAsientosOcupados: jest.fn(async () => null),
  leerBoletosDelViaje: jest.fn(async () => []),
  publicarBoletos: jest.fn(),
}));

import { publicarBoletos } from '@/servicios/supabase/boletosCompartidos';

import { ProveedorBoletos } from './ProveedorBoletos';
import { VIAJE_BOACO } from './muestra';
import { reiniciarMuestra } from './useSalidas';
import { useBoletos } from './useBoletos';

function Envoltorio({ children }: { children: ReactNode }) {
  return <ProveedorBoletos>{children}</ProveedorBoletos>;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});
afterEach(() => reiniciarMuestra());

const PASAJEROS = [{ asiento: 8, nombre: 'Ana Ruiz' }];

describe('reservar contra el servidor', () => {
  it('no guarda la reserva si otro teléfono vendió el asiento primero', async () => {
    jest
      .mocked(publicarBoletos)
      .mockResolvedValue({ conflictos: ['x'], fallidos: [] });
    const { result } = await renderHook(() => useBoletos(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    let resultado;
    await act(async () => {
      resultado = await result.current.reservar(VIAJE_BOACO, PASAJEROS);
    });
    expect(resultado).toEqual({ error: 'asiento-ocupado', ok: false });
    expect(result.current.boletos).toHaveLength(0);
  });

  it('sin red la reserva se guarda y se sube después', async () => {
    jest
      .mocked(publicarBoletos)
      .mockResolvedValue({ conflictos: [], fallidos: ['x'] });
    const { result } = await renderHook(() => useBoletos(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    let resultado;
    await act(async () => {
      resultado = await result.current.reservar(VIAJE_BOACO, PASAJEROS);
    });
    expect(resultado).toMatchObject({ ok: true });
    expect(result.current.boletos).toHaveLength(1);
  });
});
