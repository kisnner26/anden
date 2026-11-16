import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

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

import { AbridorViajeEnCurso } from './AbridorViajeEnCurso';

const enCurso = boletoDePrueba(new Date(Date.now() - 10 * 60_000));

beforeEach(() => {
  mockPush.mockClear();
  mockRuta = '/viajar';
  jest.mocked(useBoletoEnCurso).mockReturnValue(null);
});

describe('AbridorViajeEnCurso', () => {
  it('sin viaje en curso no abre nada', async () => {
    await render(<AbridorViajeEnCurso />);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('cuando el viaje está en curso abre su pantalla con el boleto', async () => {
    jest.mocked(useBoletoEnCurso).mockReturnValue(enCurso);
    await render(<AbridorViajeEnCurso />);
    expect(mockPush).toHaveBeenCalledWith({
      params: { id: 'bol_K7RM4QX9' },
      pathname: '/en-curso/[id]',
    });
  });

  it('no la abre otra vez para el mismo viaje', async () => {
    jest.mocked(useBoletoEnCurso).mockReturnValue(enCurso);
    const pantalla = await render(<AbridorViajeEnCurso />);
    await pantalla.rerender(<AbridorViajeEnCurso />);
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('si ya está en esa pantalla no la apila de nuevo', async () => {
    mockRuta = '/en-curso/bol_K7RM4QX9';
    jest.mocked(useBoletoEnCurso).mockReturnValue(enCurso);
    await render(<AbridorViajeEnCurso />);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
