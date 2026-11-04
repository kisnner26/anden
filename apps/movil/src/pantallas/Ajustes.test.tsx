import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('@/datos/ubicacion', () => ({
  consultarAccesoUbicacion: jest.fn(),
  solicitarAccesoUbicacion: jest.fn(),
}));

import { ProveedorUbicacion } from '@/datos/ProveedorUbicacion';
import { CLAVE_UBICACION_AUTOMATICA } from '@/datos/preferenciaUbicacion';
import {
  consultarAccesoUbicacion,
  solicitarAccesoUbicacion,
} from '@/datos/ubicacion';
import { renderPantalla } from '@/pruebas/render';
import { CLAVE_PREFERENCIA_TEMA, ProveedorTema } from '@/tema/ProveedorTema';

import { Ajustes } from './Ajustes';

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

describe('Ajustes', () => {
  it('muestra las tres opciones con el claro elegido por defecto', async () => {
    const pantalla = await renderPantalla(
      <ProveedorTema>
        <Ajustes alVolver={() => undefined} />
      </ProveedorTema>,
    );
    expect(pantalla.getAllByRole('radio')).toHaveLength(3);
    expect(
      pantalla.getByRole('radio', { name: 'Claro' }).props.accessibilityState,
    ).toEqual({ checked: true });
  });

  it('cambia a oscuro y lo guarda', async () => {
    const pantalla = await renderPantalla(
      <ProveedorTema>
        <Ajustes alVolver={() => undefined} />
      </ProveedorTema>,
    );
    await fireEvent.press(pantalla.getByRole('radio', { name: 'Oscuro' }));
    await waitFor(async () =>
      expect(await AsyncStorage.getItem(CLAVE_PREFERENCIA_TEMA)).toBe('oscuro'),
    );
    expect(
      pantalla.getByRole('radio', { name: 'Oscuro' }).props.accessibilityState,
    ).toEqual({ checked: true });
  });

  it('vuelve al presionar la flecha', async () => {
    const alVolver = jest.fn();
    const pantalla = await renderPantalla(<Ajustes alVolver={alVolver} />);
    await fireEvent.press(pantalla.getByRole('button', { name: 'Volver' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });

  it('invita a completar el perfil y lo abre', async () => {
    const alAbrirPerfil = jest.fn();
    const pantalla = await renderPantalla(
      <ProveedorTema>
        <Ajustes alAbrirPerfil={alAbrirPerfil} alVolver={() => undefined} />
      </ProveedorTema>,
    );
    expect(pantalla.getByText('Completá tu perfil')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Tu perfil y tus pasajeros' }),
    );
    expect(alAbrirPerfil).toHaveBeenCalledTimes(1);
  });

  it('activa ubicación automática desde un interruptor persistente', async () => {
    const pantalla = await renderPantalla(
      <ProveedorUbicacion>
        <Ajustes alVolver={() => undefined} />
      </ProveedorUbicacion>,
    );
    const interruptor = await pantalla.findByRole('switch', {
      name: 'Ubicación automática',
    });
    await waitFor(() =>
      expect(interruptor.props.accessibilityState).toEqual({
        checked: false,
        disabled: false,
      }),
    );

    await fireEvent.press(interruptor);

    await waitFor(() =>
      expect(interruptor.props.accessibilityState).toEqual({
        checked: true,
        disabled: false,
      }),
    );
    expect(
      pantalla.getByText('Lista para encontrar tu terminal.'),
    ).toBeTruthy();
    expect(await AsyncStorage.getItem(CLAVE_UBICACION_AUTOMATICA)).toBe('1');
  });

  it('deja reintentar un fallo desde configuración', async () => {
    jest
      .mocked(solicitarAccesoUbicacion)
      .mockResolvedValueOnce({ estado: 'error' })
      .mockResolvedValueOnce({ estado: 'otorgado' });
    const pantalla = await renderPantalla(
      <ProveedorUbicacion>
        <Ajustes alVolver={() => undefined} />
      </ProveedorUbicacion>,
    );
    const interruptor = await pantalla.findByRole('switch', {
      name: 'Ubicación automática',
    });
    await waitFor(() =>
      expect(interruptor.props.accessibilityState?.disabled).toBe(false),
    );
    await fireEvent.press(interruptor);
    const reintentar = await pantalla.findByRole('button', {
      name: 'Reintentar',
    });

    await fireEvent.press(reintentar);

    await waitFor(() =>
      expect(
        pantalla.getByText('Lista para encontrar tu terminal.'),
      ).toBeTruthy(),
    );
    expect(solicitarAccesoUbicacion).toHaveBeenCalledTimes(2);
  });
});
