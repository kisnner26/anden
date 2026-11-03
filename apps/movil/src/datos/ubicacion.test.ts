import { describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-location', () => ({
  Accuracy: { Low: 1 },
  PermissionStatus: {
    DENIED: 'denied',
    GRANTED: 'granted',
    UNDETERMINED: 'undetermined',
  },
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

import * as Location from 'expo-location';
import { consultarAccesoUbicacion, obtenerUbicacionActual } from './ubicacion';

describe('consultarAccesoUbicacion', () => {
  it('distingue cuando el sistema desactivó los servicios', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(false);

    await expect(consultarAccesoUbicacion()).resolves.toEqual({
      estado: 'desactivado',
    });
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('mantiene pendiente un permiso que nunca se preguntó', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({
      canAskAgain: true,
      status: Location.PermissionStatus.UNDETERMINED,
    } as never);

    await expect(consultarAccesoUbicacion()).resolves.toEqual({
      estado: 'pendiente',
    });
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('reconoce un permiso ya otorgado sin leer la posición', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({
      canAskAgain: true,
      status: Location.PermissionStatus.GRANTED,
    } as never);

    await expect(consultarAccesoUbicacion()).resolves.toEqual({
      estado: 'otorgado',
    });
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('expone si un permiso denegado requiere abrir ajustes', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({
      canAskAgain: false,
      status: Location.PermissionStatus.DENIED,
    } as never);

    await expect(consultarAccesoUbicacion()).resolves.toEqual({
      estado: 'denegado',
      puedePreguntar: false,
    });
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });
});

describe('obtenerUbicacionActual', () => {
  it('no solicita permiso si la ubicación del sistema está desactivada', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(false);

    await expect(obtenerUbicacionActual()).resolves.toEqual({
      estado: 'desactivado',
    });
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('no lee la posición si se deniega el permiso', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValue({ status: 'denied' } as never);
    await expect(obtenerUbicacionActual()).resolves.toEqual({
      estado: 'denegado',
    });
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('pide precisión baja y devuelve el punto actual', async () => {
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValue({ status: 'granted' } as never);
    jest.mocked(Location.getCurrentPositionAsync).mockResolvedValue({
      coords: { latitude: 12.13, longitude: -86.25 },
    } as never);
    await expect(obtenerUbicacionActual()).resolves.toEqual({
      estado: 'otorgado',
      punto: { lat: 12.13, lng: -86.25 },
    });
    expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
      accuracy: Location.Accuracy.Low,
    });
  });
});
