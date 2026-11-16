import type { MensajeViaje } from './mensajesViaje';

/**
 * sin servidor (pruebas y modo de muestra) los mensajes viven en la memoria de la app: así la
 * conversación se puede probar completa en un solo teléfono
 */
const guardados: MensajeViaje[] = [];

export function leerMensajesLocales(
  viajeId: string,
  hilo: string,
): MensajeViaje[] {
  return guardados.filter(
    (mensaje) => mensaje.viajeId === viajeId && mensaje.hilo === hilo,
  );
}

export function guardarMensajeLocal(mensaje: MensajeViaje): void {
  guardados.push(mensaje);
}

/** vacía lo guardado; solo para pruebas */
export function reiniciarMensajesLocales(): void {
  guardados.length = 0;
}
