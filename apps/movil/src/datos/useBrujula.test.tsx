import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';

jest.mock('expo-location', () => ({
  Accuracy: { High: 6 },
  hasServicesEnabledAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  watchHeadingAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

import * as Location from 'expo-location';

import { useBrujula } from './useBrujula';

const quitar = jest.fn();
let enPosicion: (l: unknown) => void = () => undefined;
let enRumbo: (l: unknown) => void = () => undefined;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
  jest
    .mocked(Location.requestForegroundPermissionsAsync)
    .mockResolvedValue({ status: 'granted' } as never);
  jest.mocked(Location.watchPositionAsync).mockImplementation((async (
    _o: unknown,
    cb: (l: unknown) => void,
  ) => {
    enPosicion = cb;
    return { remove: quitar };
  }) as never);
  jest.mocked(Location.watchHeadingAsync).mockImplementation((async (
    cb: (l: unknown) => void,
  ) => {
    enRumbo = cb;
    return { remove: quitar };
  }) as never);
});

describe('useBrujula', () => {
  it('sin permiso lo dice y no sigue nada', async () => {
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValue({ status: 'denied' } as never);
    const { result } = await renderHook(() => useBrujula(true));
    await waitFor(() => expect(result.current.estado).toBe('sin-permiso'));
    expect(Location.watchPositionAsync).not.toHaveBeenCalled();
  });

  it('con la ubicación apagada lo dice', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(false);
    const { result } = await renderHook(() => useBrujula(true));
    await waitFor(() => expect(result.current.estado).toBe('desactivado'));
  });

  it('sigue la posición y hacia dónde mira el teléfono', async () => {
    const { result } = await renderHook(() => useBrujula(true));
    await waitFor(() => expect(Location.watchHeadingAsync).toHaveBeenCalled());
    await act(async () => {
      enPosicion({ coords: { latitude: 12.1, longitude: -86.2 } });
      enRumbo({ magHeading: 40, trueHeading: 45 });
    });
    expect(result.current.estado).toBe('listo');
    expect(result.current.posicion).toEqual({ lat: 12.1, lng: -86.2 });
    expect(result.current.haciaDondeMira).toBe(45);
  });

  it('usa el rumbo magnético si no hay verdadero', async () => {
    const { result } = await renderHook(() => useBrujula(true));
    await waitFor(() => expect(Location.watchHeadingAsync).toHaveBeenCalled());
    await act(async () => {
      enRumbo({ magHeading: 40, trueHeading: -1 });
    });
    expect(result.current.haciaDondeMira).toBe(40);
  });

  it('suelta las lecturas al desmontarse', async () => {
    const { unmount } = await renderHook(() => useBrujula(true));
    await waitFor(() => expect(Location.watchHeadingAsync).toHaveBeenCalled());
    await unmount();
    expect(quitar).toHaveBeenCalledTimes(2);
  });

  it('inactiva no pide nada', async () => {
    await renderHook(() => useBrujula(false));
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });
});
