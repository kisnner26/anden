import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, render } from '@testing-library/react-native';
import { notificationAsync } from 'expo-haptics';

import { reproducirSonido } from '@/datos/sonidos';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

import { CuentaCreada } from './CuentaCreada';

jest.mock('expo-haptics', () => ({
  NotificationFeedbackType: { Success: 'success' },
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/datos/sonidos', () => ({
  reproducirSonido: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/tema/useMovimientoReducido', () => ({
  useMovimientoReducido: jest.fn(() => false),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  jest.mocked(useMovimientoReducido).mockReturnValue(false);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('CuentaCreada', () => {
  it('saluda a la persona por su nombre', async () => {
    const pantalla = await render(
      <CuentaCreada alTerminar={jest.fn()} nombre="Ana" />,
    );
    expect(
      pantalla.getByText(rellenar(t('cuenta.bienvenida'), { nombre: 'Ana' })),
    ).toBeTruthy();
  });

  it('explica qué sigue', async () => {
    const pantalla = await render(
      <CuentaCreada alTerminar={jest.fn()} nombre="Ana" />,
    );
    expect(pantalla.getByText(t('cuenta.bienvenidaDetalle'))).toBeTruthy();
  });

  it('se anuncia a quien usa lector de pantalla', async () => {
    const pantalla = await render(
      <CuentaCreada alTerminar={jest.fn()} nombre="Ana" />,
    );
    expect(
      pantalla.getByTestId('cuenta-creada').props.accessibilityLiveRegion,
    ).toBe('assertive');
  });

  it('vibra y suena al aparecer', async () => {
    await render(<CuentaCreada alTerminar={jest.fn()} nombre="Ana" />);
    expect(notificationAsync).toHaveBeenCalledTimes(1);
    expect(reproducirSonido).toHaveBeenCalledWith('bienvenida');
  });

  it('no termina antes de tiempo', async () => {
    const alTerminar = jest.fn();
    await render(<CuentaCreada alTerminar={alTerminar} nombre="Ana" />);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(alTerminar).not.toHaveBeenCalled();
  });
});
