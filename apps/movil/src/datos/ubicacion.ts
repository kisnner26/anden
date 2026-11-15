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

const ESPERA_GPS_MS = 10_000;

function conLimite<T>(promesa: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolver) => {
    const reloj = setTimeout(() => resolver(null), ms);
    promesa.then(
      (valor) => {
        clearTimeout(reloj);
        resolver(valor);
      },
      () => {
        clearTimeout(reloj);
        resolver(null);
      },
    );
  });
}

/**
 * la lectura del GPS sin quedarse colgado: la más precisa tiene diez segundos (adentro de un edificio puede no llegar
 * nunca) y, si no llega, se usa una lectura de precisión media o la última conocida del teléfono
 */
async function leerPosicion(precisa: boolean) {
  const primera = await conLimite(
    Location.getCurrentPositionAsync({
      accuracy: precisa ? Location.Accuracy.High : Location.Accuracy.Low,
    }),
    ESPERA_GPS_MS,
  );
  if (primera) return primera;
  const media = await conLimite(
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    ESPERA_GPS_MS,
  );
  if (media) return media;
  return conLimite(Location.getLastKnownPositionAsync(), ESPERA_GPS_MS);
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

    const ubicacion = await leerPosicion(precisa);
    if (ubicacion === null) return { estado: 'error' };
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
