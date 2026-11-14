/** cuántos minutos antes de la salida empieza a llenarse la barra del boleto */
export const VENTANA_PROGRESO_MIN = 180;

/**
 * qué tan cerca está la salida, de 0 a 1: 0 si falta más de la ventana (o el viaje ya pasó) y 1 cuando
 * sale; así la barra del boleto se va llenando conforme se acerca la hora
 */
export function progresoHaciaSalida(
  minutosParaSalir: number,
  ventana: number = VENTANA_PROGRESO_MIN,
): number {
  if (minutosParaSalir > ventana) return 0;
  if (minutosParaSalir <= 0) return 1;
  return 1 - minutosParaSalir / ventana;
}
