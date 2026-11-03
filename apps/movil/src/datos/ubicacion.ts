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
