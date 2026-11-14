import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { renderPantalla } from '@/pruebas/render';

import { Portada } from './Portada';

const mockReproducir = jest.fn<(nombre: string) => Promise<void>>(
  async () => undefined,
);
const mockLiberar = jest.fn();

jest.mock('@/datos/sonidos', () => ({
  liberarSonidos: () => mockLiberar(),
  reproducirSonido: (nombre: string) => mockReproducir(nombre),
}));

const reducido = useReducedMotion as unknown as jest.Mock;

function activar(control: Parameters<typeof fireEvent>[0]) {
  return fireEvent(control, 'accessibilityAction', {
    nativeEvent: { actionName: 'activate' },
  });
}

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  reducido.mockReturnValue(false);
});

describe('Portada', () => {
  it('muestra el lema y el lugar', async () => {
    const pantalla = await renderPantalla(
      <Portada alEmpezar={() => undefined} />,
    );
    expect(pantalla.getByText('Managua · Nicaragua')).toBeTruthy();
    expect(pantalla.getByText(/Tu viaje en bus,/)).toBeTruthy();
  });

  it('arranca el motor al llegar el bus', async () => {
    await renderPantalla(<Portada alEmpezar={() => undefined} />);
    expect(mockReproducir).toHaveBeenCalledWith('arranque');
  });

  it('despide al bus con bocina y avisa al terminar la salida', async () => {
    jest.useFakeTimers();
    const alEmpezar = jest.fn();
    const pantalla = await renderPantalla(<Portada alEmpezar={alEmpezar} />);
    await activar(
      pantalla.getByRole('button', { name: 'Deslizar para empezar' }),
    );
    expect(mockReproducir).toHaveBeenCalledWith('bocina');
    expect(alEmpezar).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(mockReproducir).toHaveBeenCalledWith('salida');
    expect(alEmpezar).toHaveBeenCalledTimes(1);
  });

  it('con reducir movimiento no anima ni espera para empezar', async () => {
    reducido.mockReturnValue(true);
    const alEmpezar = jest.fn();
    const pantalla = await renderPantalla(<Portada alEmpezar={alEmpezar} />);
    expect(mockReproducir).not.toHaveBeenCalled();
    await activar(
      pantalla.getByRole('button', { name: 'Deslizar para empezar' }),
    );
    expect(alEmpezar).toHaveBeenCalledTimes(1);
  });

  it('con el inicio automático encendido arranca sola, rápido y sin pedir deslizar', async () => {
    await AsyncStorage.setItem('anden.inicioAutomatico', '1');
    jest.useFakeTimers();
    const alEmpezar = jest.fn();
    const pantalla = await renderPantalla(<Portada alEmpezar={alEmpezar} />);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(50);
    });
    expect(
      pantalla.queryByRole('button', { name: 'Deslizar para empezar' }),
    ).toBeNull();
    expect(pantalla.getByText('Arrancando…')).toBeTruthy();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(2300);
    });
    expect(mockReproducir).toHaveBeenCalledWith('bocina');
    expect(alEmpezar).toHaveBeenCalledTimes(1);
    await AsyncStorage.clear();
  });

  it('sin el inicio automático espera a que la persona deslice', async () => {
    await AsyncStorage.clear();
    jest.useFakeTimers();
    const alEmpezar = jest.fn();
    await renderPantalla(<Portada alEmpezar={alEmpezar} />);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10_000);
    });
    expect(alEmpezar).not.toHaveBeenCalled();
  });

  it('libera los sonidos al salir de la portada', async () => {
    const pantalla = await renderPantalla(
      <Portada alEmpezar={() => undefined} />,
    );
    await pantalla.unmount();
    expect(mockLiberar).toHaveBeenCalled();
  });

  it('no avanza sola: hay que deslizar para entrar', async () => {
    jest.useFakeTimers();
    const alEmpezar = jest.fn();
    await renderPantalla(<Portada alEmpezar={alEmpezar} />);
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(alEmpezar).not.toHaveBeenCalled();
    expect(mockReproducir).not.toHaveBeenCalledWith('bocina');
  });

  it('con movimiento reducido tampoco avanza sola ni dibuja el velo', async () => {
    jest.useFakeTimers();
    reducido.mockReturnValue(true);
    const alEmpezar = jest.fn();
    const pantalla = await renderPantalla(<Portada alEmpezar={alEmpezar} />);
    expect(pantalla.queryByTestId('velo-portada')).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(alEmpezar).not.toHaveBeenCalled();
  });
});
