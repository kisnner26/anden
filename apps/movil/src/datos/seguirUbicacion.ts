import * as Location from 'expo-location';

import type { PosicionBus } from '@/servicios/transmision';

const CADA_CINCO_SEGUNDOS = 5000;
const CADA_QUINCE_METROS = 15;

/**
 * escucha la ubicación del teléfono mientras la app está abierta; devuelve cómo dejar de escuchar.
 * Solo en primer plano: el permiso "Siempre" queda para una etapa posterior.
 */
export async function seguirUbicacion(
  alPosicion: (posicion: PosicionBus) => void,
): Promise<() => void> {
  const suscripcion = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: CADA_QUINCE_METROS,
      timeInterval: CADA_CINCO_SEGUNDOS,
    },
    (ubicacion) =>
      alPosicion({
        lat: ubicacion.coords.latitude,
        lng: ubicacion.coords.longitude,
        registradaEn: new Date(ubicacion.timestamp).toISOString(),
        velocidadMs:
          ubicacion.coords.speed !== null && ubicacion.coords.speed >= 0
            ? ubicacion.coords.speed
            : null,
      }),
  );
  return () => suscripcion.remove();
}
