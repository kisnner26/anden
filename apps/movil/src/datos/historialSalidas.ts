import type { SalidaRegistrada } from './estimacionSalida';

let historial: SalidaRegistrada[] = [];

/** lo aprendido de los viajes que ya salieron, para estimar los próximos */
export function fijarHistorial(salidas: SalidaRegistrada[]): void {
  historial = salidas;
}

export function obtenerHistorial(): readonly SalidaRegistrada[] {
  return historial;
}

let cancelados = new Set<string>();

/** los viajes que el conductor canceló, para avisarle a quien tenía boleto */
export function fijarCancelados(ids: readonly string[]): void {
  cancelados = new Set(ids);
}

export function viajeCancelado(viajeId: string): boolean {
  return cancelados.has(viajeId);
}
