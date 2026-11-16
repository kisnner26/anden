import type { EstadoViaje } from '@anden/dominio';

/** quién escribió: la persona con boleto o el chofer del viaje */
export type AutorMensaje = 'chofer' | 'pasajero';

export interface MensajeViaje {
  de: AutorMensaje;
  enviadoEn: string;
  id: string;
  texto: string;
  viajeId: string;
}

/** el largo máximo de un mensaje: es para avisos cortos en el camino, no para conversar largo */
export const MAXIMO_MENSAJE = 240;

/** el texto listo para enviar: sin espacios de más; nulo si está vacío o pasa del máximo */
export function textoDeMensaje(texto: string): string | null {
  const limpio = texto.trim().replace(/\s+/g, ' ');
  if (limpio === '' || limpio.length > MAXIMO_MENSAJE) return null;
  return limpio;
}
