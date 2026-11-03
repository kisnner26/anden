import { describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-location', () => ({
  Accuracy: { Low: 1 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

import * as Location from 'expo-location';
import { obtenerUbicacionActual } from './ubicacion';

describe('obtenerUbicacionActual', () => {
  it('no lee la posición si se deniega el permiso', async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);
    await expect(obtenerUbicacionActual()).resolves.toEqual({ estado: 'denegado' });
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });
});
