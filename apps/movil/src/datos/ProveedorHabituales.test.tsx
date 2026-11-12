import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { CLAVE_HABITUALES, type Habitual } from '@/datos/habituales';
import { ProveedorHabituales } from '@/datos/ProveedorHabituales';
import { useHabituales } from '@/datos/useHabituales';

const HABITUAL: Habitual = {
  destino: 'Managua',
  dias: [1],
  hora: '06:00',
  id: 'hab_boaco_managua_06:00',
  origen: 'Boaco',
};

const envolver = ({ children }: { children: ReactNode }) => (
  <ProveedorHabituales>{children}</ProveedorHabituales>
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ProveedorHabituales', () => {
  it('empieza sin viajes habituales', async () => {
    const { result } = await renderHook(() => useHabituales(), {
      wrapper: envolver,
    });
    expect(result.current.habituales).toEqual([]);
  });

  it('agrega y quita un viaje y lo recuerda', async () => {
    const { result } = await renderHook(() => useHabituales(), {
      wrapper: envolver,
    });
    await act(async () => {
      await result.current.agregar(HABITUAL);
    });
    expect(result.current.habituales).toEqual([HABITUAL]);
    expect(await AsyncStorage.getItem(CLAVE_HABITUALES)).toContain('hab_boaco');

    await act(async () => {
      await result.current.quitar(HABITUAL.id);
    });
    expect(result.current.habituales).toEqual([]);
  });

  it('recupera los guardados al abrir', async () => {
    await AsyncStorage.setItem(CLAVE_HABITUALES, JSON.stringify([HABITUAL]));
    const { result } = await renderHook(() => useHabituales(), {
      wrapper: envolver,
    });
    await waitFor(() => expect(result.current.habituales).toHaveLength(1));
  });
});
