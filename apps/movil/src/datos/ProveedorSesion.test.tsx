import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { useSesion } from '@/datos/useSesion';

const envolver = ({ children }: { children: ReactNode }) => (
  <ProveedorSesion>{children}</ProveedorSesion>
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ProveedorSesion', () => {
  it('empieza como pasajero sin sesión', async () => {
    const { result } = await renderHook(() => useSesion(), {
      wrapper: envolver,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.rol).toBe('pasajero');
    expect(result.current.sesion).toBeNull();
  });

  it('pasa a conductor al iniciar sesión y vuelve a pasajero al cerrarla', async () => {
    const { result } = await renderHook(() => useSesion(), {
      wrapper: envolver,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));

    await act(async () => {
      await result.current.iniciar('1003', '2026');
    });
    expect(result.current.rol).toBe('conductor');
    expect(result.current.sesion?.choferId).toBe('cho_3');

    await act(async () => {
      await result.current.cerrar();
    });
    expect(result.current.rol).toBe('pasajero');
  });

  it('con credenciales malas sigue siendo pasajero', async () => {
    const { result } = await renderHook(() => useSesion(), {
      wrapper: envolver,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    let resultado: unknown;
    await act(async () => {
      resultado = await result.current.iniciar('1003', 'mala');
    });
    expect(resultado).toEqual({ error: 'credenciales', ok: false });
    expect(result.current.rol).toBe('pasajero');
  });

  it('recupera la sesión guardada al abrir la app', async () => {
    await AsyncStorage.setItem(
      'anden.sesion',
      JSON.stringify({
        choferId: 'cho_1',
        nombre: 'Ernesto Calero',
        rol: 'conductor',
      }),
    );
    const { result } = await renderHook(() => useSesion(), {
      wrapper: envolver,
    });
    await waitFor(() => expect(result.current.rol).toBe('conductor'));
  });
});
