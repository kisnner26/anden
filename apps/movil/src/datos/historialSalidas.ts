import type { SalidaRegistrada } from './estimacionSalida';

let historial: SalidaRegistrada[] = [];

/** lo aprendido de los viajes que ya salieron, para estimar los próximos */
export function fijarHistorial(salidas: SalidaRegistrada[]): void {
  historial = salidas;
}

export function obtenerHistorial(): readonly SalidaRegistrada[] {
  return historial;
}
