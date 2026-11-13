import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { DisponibilidadIA, ServicioIA } from '@/servicios/ia';

import { ProveedorIA } from './ProveedorIA';
import { useIA } from './useIA';

function servicioFalso(estado: DisponibilidadIA): ServicioIA {
  return {
    disponibilidad: async () => estado,
    nombre: 'Apple Intelligence',
    preguntar: async (_instrucciones, pregunta) => `respuesta a ${pregunta}`,
    proveedor: 'apple',
  };
}

function envoltura(estado: DisponibilidadIA) {
  return ({ children }: { children: ReactNode }) => (
    <ProveedorIA servicio={servicioFalso(estado)}>{children}</ProveedorIA>
  );
}

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('ProveedorIA', () => {
  it('arranca apagada aunque el teléfono la soporte', async () => {
    const { result } = await renderHook(() => useIA(), {
      wrapper: envoltura('disponible'),
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.disponibilidad).toBe('disponible');
    expect(result.current.activada).toBe(false);
    expect(result.current.usable).toBe(false);
  });

  it('al activarla queda usable y se recuerda', async () => {
    const { result } = await renderHook(() => useIA(), {
      wrapper: envoltura('disponible'),
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      await result.current.cambiar(true);
    });
    expect(result.current.usable).toBe(true);
    expect(await AsyncStorage.getItem('anden.ia')).toBe('1');
    expect(await result.current.preguntar('x', 'hola')).toBe(
      'respuesta a hola',
    );
  });

  it('activada pero sin soporte en el teléfono no es usable', async () => {
    const { result } = await renderHook(() => useIA(), {
      wrapper: envoltura('no-compatible'),
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      await result.current.cambiar(true);
    });
    expect(result.current.activada).toBe(true);
    expect(result.current.usable).toBe(false);
  });
});
