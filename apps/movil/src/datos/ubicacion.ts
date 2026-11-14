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
  | { estado: 'desactivado' }
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

/** pide permiso tras una acción explícita sin conservar ni devolver coordenadas. */
export async function solicitarAccesoUbicacion(): Promise<EstadoAccesoUbicacion> {
  try {
    const serviciosActivos = await Location.hasServicesEnabledAsync();
    if (!serviciosActivos) return { estado: 'desactivado' };

    const permiso = await Location.requestForegroundPermissionsAsync();
    if (permiso.status === Location.PermissionStatus.GRANTED) {
      return { estado: 'otorgado' };
    }
    if (permiso.status === Location.PermissionStatus.UNDETERMINED) {
      return { estado: 'pendiente' };
    }
    return {
      estado: 'denegado',
      puedePreguntar: permiso.canAskAgain,
    };
  } catch {
    return { estado: 'error' };
  }
}

/**
 * solicita ubicación solo después de una acción explícita de la persona; `precisa` pide la mejor lectura del GPS,
 * que hace falta para marcar un punto de abordaje, y por defecto es aproximada, que alcanza para ver lo que hay cerca
 */
export async function obtenerUbicacionActual(
  precisa = false,
): Promise<ResultadoUbicacion> {
  try {
    const serviciosActivos = await Location.hasServicesEnabledAsync();
    if (serviciosActivos === false) return { estado: 'desactivado' };

    const permiso = await Location.requestForegroundPermissionsAsync();
    if (permiso.status !== 'granted') return { estado: 'denegado' };

    const ubicacion = await Location.getCurrentPositionAsync({
      accuracy: precisa ? Location.Accuracy.High : Location.Accuracy.Low,
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
