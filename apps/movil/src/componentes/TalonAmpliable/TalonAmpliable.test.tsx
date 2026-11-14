import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Brightness from 'expo-brightness';
import { Animated, Text } from 'react-native';

import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { OverlayBoleto } from './OverlayBoleto';
import { TalonAmpliable } from './TalonAmpliable';
import { useBrilloMaximo } from './useBrilloMaximo';

jest.mock('expo-brightness', () => ({
  getBrightnessAsync: jest.fn(async () => 0.4),
  setBrightnessAsync: jest.fn(async () => undefined),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useBrilloMaximo', () => {
  it('sube el brillo al máximo mientras está activo y lo devuelve al soltar', async () => {
    const { rerender } = await renderHook(
      ({ activo }: { activo: boolean }) => useBrilloMaximo(activo),
      { initialProps: { activo: false } },
    );
    expect(Brightness.setBrightnessAsync).not.toHaveBeenCalled();
    await rerender({ activo: true });
    await waitFor(() =>
      expect(Brightness.setBrightnessAsync).toHaveBeenCalledWith(1),
    );
    await rerender({ activo: false });
    await waitFor(() =>
      expect(Brightness.setBrightnessAsync).toHaveBeenLastCalledWith(0.4),
    );
  });

  it('si el teléfono no deja cambiar el brillo no rompe nada', async () => {
    jest
      .mocked(Brightness.getBrightnessAsync)
      .mockRejectedValueOnce(new Error('sin permiso'));
    const { rerender } = await renderHook(
      ({ activo }: { activo: boolean }) => useBrilloMaximo(activo),
      { initialProps: { activo: false } },
    );
    await act(async () => {
      await rerender({ activo: true });
    });
    expect(Brightness.setBrightnessAsync).not.toHaveBeenCalled();
  });
});

describe('OverlayBoleto', () => {
  it('dibuja el QR grande con el código, el destino y el asiento', async () => {
    const progreso = new Animated.Value(1);
    const p = await renderPantalla(
      <OverlayBoleto
        guardado={boletoDePrueba(new Date(2026, 10, 14, 15, 30))}
        progreso={progreso}
        tamanoQR={120}
      />,
    );
    const ver = { includeHiddenElements: true };
    expect(p.getByTestId('boleto-ampliado', ver)).toBeTruthy();
    expect(p.getByLabelText('QR K7RM4QX9', ver)).toBeTruthy();
    expect(p.getByText('K7RM 4QX9', ver)).toBeTruthy();
    expect(p.getByText('Asiento 8', ver)).toBeTruthy();
    expect(p.getByText(/3:30 p. m./, ver)).toBeTruthy();
  });
});

describe('TalonAmpliable', () => {
  it('muestra el boleto que envuelve', async () => {
    const p = await renderPantalla(
      <TalonAmpliable habilitado progreso={new Animated.Value(0)}>
        <Text>el boleto</Text>
      </TalonAmpliable>,
    );
    expect(p.getByText('el boleto')).toBeTruthy();
  });

  it('con el boleto ya usado ofrece la acción de ampliar solo si está habilitado', async () => {
    const habilitado = await renderPantalla(
      <TalonAmpliable habilitado progreso={new Animated.Value(0)}>
        <Text>a</Text>
      </TalonAmpliable>,
    );
    expect(habilitado.toJSON()).toBeTruthy();
    const apagado = await renderPantalla(
      <TalonAmpliable habilitado={false} progreso={new Animated.Value(0)}>
        <Text>b</Text>
      </TalonAmpliable>,
    );
    expect(apagado.getByText('b')).toBeTruthy();
  });
});
