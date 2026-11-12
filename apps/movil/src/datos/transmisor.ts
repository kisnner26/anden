import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { TRANSMISION } from '@/servicios/transmision';

import { seguirUbicacion } from './seguirUbicacion';
import { solicitarAccesoUbicacion } from './ubicacion';

export type ResultadoTransmision =
  'desactivado' | 'error' | 'ok' | 'permiso-negado';

const ETIQUETA_PANTALLA = 'anden-transmision';
const dejarDeEscuchar = new Map<string, () => void>();

/**
 * empieza a compartir la posición de un viaje: pide el permiso, escucha el GPS y lo publica;
 * mantiene la pantalla encendida mientras dura. Sigue aunque se cambie de pantalla dentro de la app.
 */
export async function iniciarTransmision(
  viajeId: string,
  choferId: string,
): Promise<ResultadoTransmision> {
  if (dejarDeEscuchar.has(viajeId)) return 'ok';

  const acceso = await solicitarAccesoUbicacion();
  if (acceso.estado === 'desactivado') return 'desactivado';
  if (acceso.estado === 'denegado' || acceso.estado === 'pendiente') {
    return 'permiso-negado';
  }
  if (acceso.estado !== 'otorgado') return 'error';

  try {
    TRANSMISION.iniciar(viajeId, choferId);
    const parar = await seguirUbicacion((posicion) =>
      TRANSMISION.publicar(viajeId, posicion),
    );
    dejarDeEscuchar.set(viajeId, parar);
    void activateKeepAwakeAsync(ETIQUETA_PANTALLA).catch(() => undefined);
    return 'ok';
  } catch {
    TRANSMISION.detener(viajeId);
    return 'error';
  }
}

export function detenerTransmision(viajeId: string): void {
  dejarDeEscuchar.get(viajeId)?.();
  dejarDeEscuchar.delete(viajeId);
  TRANSMISION.detener(viajeId);
  if (dejarDeEscuchar.size === 0) {
    void Promise.resolve(deactivateKeepAwake(ETIQUETA_PANTALLA)).catch(
      () => undefined,
    );
  }
}

/** corta todas las transmisiones, por ejemplo al cerrar la sesión del conductor */
export function detenerTodas(): void {
  for (const viajeId of [...dejarDeEscuchar.keys()])
    detenerTransmision(viajeId);
}
