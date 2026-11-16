import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3, High: 4, Low: 1 },
  PermissionStatus: {
    DENIED: 'denied',
    GRANTED: 'granted',
    UNDETERMINED: 'undetermined',
  },
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

import * as Location from 'expo-location';
import {
  consultarAccesoUbicacion,
  obtenerUbicacionActual,
  solicitarAccesoUbicacion,
} from './ubicacion';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('solicitarAccesoUbicacion', () => {
  it('obtiene permiso sin leer coordenadas', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      canAskAgain: true,
      status: Location.PermissionStatus.GRANTED,
    } as never);

    await expect(solicitarAccesoUbicacion()).resolves.toEqual({
      estado: 'otorgado',
    });
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('avisa si los servicios de ubicación están apagados sin pedir permiso', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(false);
    await expect(solicitarAccesoUbicacion()).resolves.toEqual({
      estado: 'desactivado',
    });
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('deja pendiente un permiso sin respuesta', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      canAskAgain: true,
      status: Location.PermissionStatus.UNDETERMINED,
    } as never);
    await expect(solicitarAccesoUbicacion()).resolves.toEqual({
      estado: 'pendiente',
    });
  });

  it('si lo deniegan dice si todavía se puede volver a preguntar', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      canAskAgain: false,
      status: Location.PermissionStatus.DENIED,
    } as never);
    await expect(solicitarAccesoUbicacion()).resolves.toEqual({
      estado: 'denegado',
      puedePreguntar: false,
    });
  });

  it('si el sistema falla responde error', async () => {
    jest
      .mocked(Location.hasServicesEnabledAsync)
      .mockRejectedValue(new Error('x'));
    await expect(solicitarAccesoUbicacion()).resolves.toEqual({
      estado: 'error',
    });
  });
});

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

  it('convierte un fallo al pedir permiso en error recuperable', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockRejectedValue(new Error('proveedor no disponible'));

    await expect(obtenerUbicacionActual()).resolves.toEqual({
      estado: 'error',
    });
  });

  it('convierte un fallo al leer posición en error recuperable', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValue({ status: 'granted' } as never);
    jest
      .mocked(Location.getCurrentPositionAsync)
      .mockRejectedValue(new Error('sin señal'));

    await expect(obtenerUbicacionActual()).resolves.toEqual({
      estado: 'error',
    });
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

  it('si el GPS preciso no responde, no se cuelga: usa la última posición conocida', async () => {
    jest.useFakeTimers();
    try {
      jest
        .mocked(Location.requestForegroundPermissionsAsync)
        .mockResolvedValue({ status: 'granted' } as never);
      jest
        .mocked(Location.getCurrentPositionAsync)
        .mockReturnValue(new Promise(() => undefined));
      jest.mocked(Location.getLastKnownPositionAsync).mockResolvedValue({
        coords: { latitude: 12.1, longitude: -86.2 },
      } as never);
      const resultado = obtenerUbicacionActual(true);
      await jest.advanceTimersByTimeAsync(25_000);
      await expect(resultado).resolves.toEqual({
        estado: 'otorgado',
        punto: { lat: 12.1, lng: -86.2 },
      });
    } finally {
      jest.useRealTimers();
    }
  });
});
