import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { CUENTAS_MUESTRA } from '@/servicios/cuentasMuestra';
import { crearSesionLocal } from '@/servicios/sesion';

import { CLAVE_PERFIL, ProveedorPerfil } from './ProveedorPerfil';
import { ProveedorSesion } from './ProveedorSesion';
import { usePerfil } from './usePerfil';

function envoltura({ children }: { children: ReactNode }) {
  return <ProveedorPerfil>{children}</ProveedorPerfil>;
}

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('ProveedorPerfil', () => {
  it('empieza con el perfil vacío y termina de cargar', async () => {
    const { result } = await renderHook(() => usePerfil(), {
      wrapper: envoltura,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.perfil.nombre).toBe('');
  });

  it('guarda los cambios en el teléfono', async () => {
    const { result } = await renderHook(() => usePerfil(), {
      wrapper: envoltura,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      await result.current.guardar({ nombre: 'Ana', telefono: '88881234' });
    });
    expect(result.current.perfil.nombre).toBe('Ana');
    const guardado = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_PERFIL)) ?? '{}',
    ) as { telefono: string };
    expect(guardado.telefono).toBe('88881234');
  });

  it('lee el perfil guardado al abrir la app', async () => {
    await AsyncStorage.setItem(
      CLAVE_PERFIL,
      JSON.stringify({ nombre: 'Luis', apellido: 'Mora' }),
    );
    const { result } = await renderHook(() => usePerfil(), {
      wrapper: envoltura,
    });
    await waitFor(() => expect(result.current.perfil.nombre).toBe('Luis'));
  });

  it('agrega y quita pasajeros guardados', async () => {
    const { result } = await renderHook(() => usePerfil(), {
      wrapper: envoltura,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      await result.current.agregarPasajero({ nombre: 'Sofía' });
    });
    expect(result.current.perfil.pasajeros).toHaveLength(1);
    const { id } = result.current.perfil.pasajeros[0]!;
    await act(async () => {
      await result.current.quitarPasajero(id);
    });
    expect(result.current.perfil.pasajeros).toHaveLength(0);
  });

  describe('con una cuenta iniciada', () => {
    const servicio = crearSesionLocal(CUENTAS_MUESTRA);
    const conSesion = ({ children }: { children: ReactNode }) => (
      <ProveedorSesion servicio={servicio}>
        <ProveedorPerfil>{children}</ProveedorPerfil>
      </ProveedorSesion>
    );

    it('muestra el nombre de la cuenta y no el perfil de otra persona del mismo teléfono', async () => {
      // el perfil de antes de que existieran las cuentas, de otra persona
      await AsyncStorage.setItem(
        CLAVE_PERFIL,
        JSON.stringify({ apellido: 'Obando', nombre: 'Kisnner' }),
      );
      await servicio.iniciar('ana', '2026');
      const { result } = await renderHook(() => usePerfil(), {
        wrapper: conSesion,
      });
      await waitFor(() => expect(result.current.perfil.nombre).toBe('Ana'));
      expect(result.current.perfil.apellido).toBe('Ruiz');
    });

    it('guarda el perfil aparte para cada cuenta', async () => {
      await servicio.iniciar('ana', '2026');
      const { result } = await renderHook(() => usePerfil(), {
        wrapper: conSesion,
      });
      await waitFor(() => expect(result.current.cargando).toBe(false));
      await act(async () => {
        await result.current.guardar({ telefono: '88881234' });
      });
      expect(await AsyncStorage.getItem(`${CLAVE_PERFIL}.ana`)).toContain(
        '88881234',
      );
      expect(await AsyncStorage.getItem(CLAVE_PERFIL)).toBeNull();
    });
  });
});
