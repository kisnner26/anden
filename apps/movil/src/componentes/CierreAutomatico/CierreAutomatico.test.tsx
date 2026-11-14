import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render } from '@testing-library/react-native';

const mockCerrar = jest.fn<(...args: unknown[]) => Promise<void>>(
  async () => undefined,
);
const mockDetener = jest.fn();
let mockProgreso: Record<string, unknown> | null = null;

jest.mock('@/datos/transmisor', () => ({
  detenerTransmision: (...a: unknown[]) => mockDetener(...a),
}));
jest.mock('@/datos/progresoViaje', () => ({
  progresoSobreTrazo: () => mockProgreso,
}));
jest.mock('@/datos/useBoletosDelViaje', () => ({
  unirBoletos: () => [],
  useBoletosDelViaje: () => ({ boletos: [] }),
}));
jest.mock('@/datos/useBoletos', () => ({
  useBoletos: () => ({ boletos: [] }),
}));
jest.mock('@/datos/useCierres', () => ({
  useCierres: () => ({ cerrar: mockCerrar, cierreDe: () => undefined }),
}));
jest.mock('@/datos/useDetalleViaje', () => ({
  useDetalleViaje: () => ({
    duracionMin: 90,
    origenCiudad: 'Managua',
    salida: { destino: 'Boaco' },
  }),
}));
jest.mock('@/datos/usePagos', () => ({ usePagos: () => ({ registro: {} }) }));
jest.mock('@/datos/useRecorrido', () => ({
  useRecorrido: () => ({
    trazo: [
      { lat: 0, lng: 0 },
      { lat: 1, lng: 1 },
    ],
  }),
}));
jest.mock('@/datos/useSesion', () => ({
  useSesion: () => ({ sesion: { choferId: 'cho_1' } }),
}));
jest.mock('@/datos/useSonidos', () => ({ useSonidos: () => jest.fn() }));
jest.mock('@/datos/useTransmision', () => ({
  useTransmision: () => ({
    activa: true,
    posicion: { lat: 1, lng: 1 },
    sinSenal: false,
  }),
  useViajesEnVivo: () => ['via_1'],
}));

import { CierreAutomatico } from './CierreAutomatico';

const EN_DESTINO = {
  desvioKm: 0.1,
  fraccion: 0.99,
  fueraDeRuta: false,
  kmRecorridos: 80,
  kmRestantes: 0.1,
  minutosRestantes: 0,
  porcentaje: 99,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

describe('CierreAutomatico', () => {
  it('lejos del destino no cierra nada', async () => {
    mockProgreso = { ...EN_DESTINO, kmRestantes: 20, minutosRestantes: 25 };
    await render(<CierreAutomatico />);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(120_000);
    });
    expect(mockCerrar).not.toHaveBeenCalled();
  });

  it('en el destino cierra el viaje solo después de mantenerse, y corta la transmisión', async () => {
    mockProgreso = { ...EN_DESTINO };
    const { rerender } = await render(<CierreAutomatico />);
    expect(mockCerrar).not.toHaveBeenCalled();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(50_000);
    });
    mockProgreso = { ...EN_DESTINO, kmRestantes: 0.09 };
    await rerender(<CierreAutomatico />);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });
    expect(mockDetener).toHaveBeenCalledWith('via_1');
    expect(mockCerrar).toHaveBeenCalledTimes(1);
  });
});
