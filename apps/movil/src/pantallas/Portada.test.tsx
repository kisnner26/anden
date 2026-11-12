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

  it('libera los sonidos al salir de la portada', async () => {
    const pantalla = await renderPantalla(
      <Portada alEmpezar={() => undefined} />,
    );
    await pantalla.unmount();
    expect(mockLiberar).toHaveBeenCalled();
  });

  it('sigue sola: al terminar la escena el bus se va sin deslizar', async () => {
    jest.useFakeTimers();
    const alEmpezar = jest.fn();
    await renderPantalla(<Portada alEmpezar={alEmpezar} />);
    await act(async () => {
      jest.advanceTimersByTime(5200 + 420 + 1300);
    });
    expect(mockReproducir).toHaveBeenCalledWith('bocina');
    expect(alEmpezar).toHaveBeenCalledTimes(1);
  });

  it('con movimiento reducido avanza sola enseguida y sin velo ni barras', async () => {
    jest.useFakeTimers();
    reducido.mockReturnValue(true);
    const alEmpezar = jest.fn();
    const pantalla = await renderPantalla(<Portada alEmpezar={alEmpezar} />);
    expect(pantalla.queryByTestId('velo-portada')).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(1300);
    });
    expect(alEmpezar).toHaveBeenCalledTimes(1);
  });
});
