import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ProveedorCierres } from '@/datos/ProveedorCierres';
import { useCierres } from '@/datos/useCierres';
import { armarCierre, CLAVE_CIERRES } from '@/servicios/cierres';

const envolver = ({ children }: { children: ReactNode }) => (
  <ProveedorCierres>{children}</ProveedorCierres>
);

const CIERRE = armarCierre(
  [{ asiento: 8, boletoId: 'b8', nombre: 'Ana Ruiz', precio: 70 }],
  {},
  'via_1',
  'cho_2',
  new Date('2026-11-12T18:00:00.000Z'),
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ProveedorCierres', () => {
  it('empieza sin cierres', async () => {
    const { result } = await renderHook(() => useCierres(), {
      wrapper: envolver,
    });
    expect(result.current.cierres).toEqual([]);
    expect(result.current.cierreDe('via_1')).toBeUndefined();
  });

  it('cierra un viaje y lo encuentra por su id', async () => {
    const { result } = await renderHook(() => useCierres(), {
      wrapper: envolver,
    });
    await act(async () => {
      await result.current.cerrar(CIERRE);
    });
    expect(result.current.cierreDe('via_1')?.total).toBe(70);
    expect(await AsyncStorage.getItem(CLAVE_CIERRES)).toContain('via_1');
  });

  it('recupera los cierres guardados', async () => {
    await AsyncStorage.setItem(CLAVE_CIERRES, JSON.stringify([CIERRE]));
    const { result } = await renderHook(() => useCierres(), {
      wrapper: envolver,
    });
    await waitFor(() => expect(result.current.cierres).toHaveLength(1));
  });
});
