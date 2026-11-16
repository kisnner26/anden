import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, render } from '@testing-library/react-native';

const mockPush = jest.fn();
let mockRuta = '/viajar';

jest.mock('expo-router', () => ({
  usePathname: () => mockRuta,
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('@/datos/useBoletoEnCurso', () => ({
  useBoletoEnCurso: jest.fn(),
}));

import { useBoletoEnCurso } from '@/datos/useBoletoEnCurso';
import { boletoDePrueba } from '@/pruebas/boletos';

import { AbridorViajeEnCurso, ESPERA_INICIAL_MS } from './AbridorViajeEnCurso';

const enCurso = boletoDePrueba(new Date(Date.now() - 10 * 60_000));

beforeEach(() => {
  jest.useFakeTimers();
  mockPush.mockClear();
  mockRuta = '/viajar';
  jest.mocked(useBoletoEnCurso).mockReturnValue(null);
});

afterEach(() => {
  jest.useRealTimers();
});

/** pasa la espera inicial: desde ahí un viaje que empieza sí se abre solo */
async function pasarLaEsperaInicial() {
  await act(async () => {
    jest.advanceTimersByTime(ESPERA_INICIAL_MS + 100);
  });
}

describe('AbridorViajeEnCurso', () => {
  it('sin viaje en curso no abre nada', async () => {
    await render(<AbridorViajeEnCurso />);
    await pasarLaEsperaInicial();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('un viaje que ya iba en curso al abrir la app no se abre solo', async () => {
    jest.mocked(useBoletoEnCurso).mockReturnValue(enCurso);
    const pantalla = await render(<AbridorViajeEnCurso />);
    await pasarLaEsperaInicial();
    await pantalla.rerender(<AbridorViajeEnCurso />);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('un viaje que empieza durante el arranque tampoco se abre solo', async () => {
    const pantalla = await render(<AbridorViajeEnCurso />);
    jest.mocked(useBoletoEnCurso).mockReturnValue(enCurso);
    await pantalla.rerender(<AbridorViajeEnCurso />);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('cuando el chofer inicia el viaje con la app abierta se abre su pantalla con el boleto', async () => {
    const pantalla = await render(<AbridorViajeEnCurso />);
    await pasarLaEsperaInicial();
    jest.mocked(useBoletoEnCurso).mockReturnValue(enCurso);
    await pantalla.rerender(<AbridorViajeEnCurso />);
    expect(mockPush).toHaveBeenCalledWith({
      params: { id: 'bol_K7RM4QX9' },
      pathname: '/en-curso/[id]',
    });
  });

  it('no la abre otra vez para el mismo viaje', async () => {
    const pantalla = await render(<AbridorViajeEnCurso />);
    await pasarLaEsperaInicial();
    jest.mocked(useBoletoEnCurso).mockReturnValue(enCurso);
    await pantalla.rerender(<AbridorViajeEnCurso />);
    await pantalla.rerender(<AbridorViajeEnCurso />);
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('si ya está en esa pantalla no la apila de nuevo', async () => {
    mockRuta = '/en-curso/bol_K7RM4QX9';
    const pantalla = await render(<AbridorViajeEnCurso />);
    await pasarLaEsperaInicial();
    jest.mocked(useBoletoEnCurso).mockReturnValue(enCurso);
    await pantalla.rerender(<AbridorViajeEnCurso />);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
