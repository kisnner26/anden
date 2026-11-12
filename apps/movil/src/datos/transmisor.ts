import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { TRANSMISION } from '@/servicios/transmision';

import { seguirUbicacion } from './seguirUbicacion';
import { solicitarAccesoUbicacion } from './ubicacion';

export type ResultadoTransmision =
  'desactivado' | 'error' | 'ok' | 'permiso-negado';

const ETIQUETA_PANTALLA = 'anden-transmision';
const dejarDeEscuchar = new Map<string, () => void>();
/** viajes que ya aparecen como activos pero todavía esperan el permiso o el primer GPS */
const arrancando = new Set<string>();

/**
 * empieza a compartir la posición de un viaje: pide el permiso, escucha el GPS y lo publica;
 * mantiene la pantalla encendida mientras dura. Sigue aunque se cambie de pantalla dentro de la app.
 */
export async function iniciarTransmision(
  viajeId: string,
  choferId: string,
): Promise<ResultadoTransmision> {
  if (dejarDeEscuchar.has(viajeId) || arrancando.has(viajeId)) return 'ok';
  arrancando.add(viajeId);
  // el estado cambia al instante, antes de pedir permisos y de que el GPS dé su primera lectura;
  // si algo falla se revierte
  TRANSMISION.iniciar(viajeId, choferId);

  try {
    const acceso = await solicitarAccesoUbicacion();
    if (acceso.estado !== 'otorgado') {
      TRANSMISION.detener(viajeId);
      if (acceso.estado === 'desactivado') return 'desactivado';
      if (acceso.estado === 'denegado' || acceso.estado === 'pendiente') {
        return 'permiso-negado';
      }
      return 'error';
    }

    const parar = await seguirUbicacion((posicion) =>
      TRANSMISION.publicar(viajeId, posicion),
    );
    // si la persona terminó el viaje mientras arrancaba el GPS, se suelta lo que se acaba de abrir
    if (!TRANSMISION.activos().includes(viajeId)) {
      parar();
      return 'ok';
    }
    dejarDeEscuchar.set(viajeId, parar);
    void activateKeepAwakeAsync(ETIQUETA_PANTALLA).catch(() => undefined);
    return 'ok';
  } catch {
    TRANSMISION.detener(viajeId);
    return 'error';
  } finally {
    arrancando.delete(viajeId);
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
