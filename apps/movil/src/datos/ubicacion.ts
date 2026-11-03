import * as Location from 'expo-location';

export type EstadoAccesoUbicacion =
  | { estado: 'pendiente' }
  | { estado: 'otorgado' }
  | { estado: 'denegado'; puedePreguntar: boolean }
  | { estado: 'desactivado' }
  | { estado: 'error' };

export type ResultadoUbicacion =
  | { estado: 'otorgado'; punto: { lat: number; lng: number } }
  | { estado: 'denegado' }
  | { estado: 'error' };

/** consulta el acceso sin abrir diálogos ni leer coordenadas. */
export async function consultarAccesoUbicacion(): Promise<EstadoAccesoUbicacion> {
  try {
    const serviciosActivos = await Location.hasServicesEnabledAsync();
    if (!serviciosActivos) return { estado: 'desactivado' };

    const permiso = await Location.getForegroundPermissionsAsync();
    if (permiso.status === Location.PermissionStatus.UNDETERMINED) {
      return { estado: 'pendiente' };
    }
    if (permiso.status === Location.PermissionStatus.GRANTED) {
      return { estado: 'otorgado' };
    }
    return {
      estado: 'denegado',
      puedePreguntar: permiso.canAskAgain,
    };
  } catch {
    return { estado: 'error' };
  }
}

/** solicita ubicación solo después de una acción explícita de la persona. */
export async function obtenerUbicacionActual(): Promise<ResultadoUbicacion> {
  const permiso = await Location.requestForegroundPermissionsAsync();
  if (permiso.status !== 'granted') return { estado: 'denegado' };
  try {
    const ubicacion = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });
    return {
      estado: 'otorgado',
      punto: {
        lat: ubicacion.coords.latitude,
        lng: ubicacion.coords.longitude,
      },
    };
  } catch {
    return { estado: 'error' };
  }
}
