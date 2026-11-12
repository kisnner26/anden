import type { BoletoGuardado } from './reserva';

export interface GrupoBoletos {
  /** destino y hora de salida: los boletos del mismo viaje comparten clave */
  clave: string;
  boletos: BoletoGuardado[];
}

/** junta en un grupo los boletos del mismo viaje, conservando el orden de entrada */
export function agruparBoletos(
  boletos: readonly BoletoGuardado[],
): GrupoBoletos[] {
  const grupos = new Map<string, GrupoBoletos>();
  for (const guardado of boletos) {
    const clave = `${guardado.resumen.destino}|${guardado.resumen.salida}`;
    const existente = grupos.get(clave);
    if (existente) existente.boletos.push(guardado);
    else grupos.set(clave, { boletos: [guardado], clave });
  }
  return [...grupos.values()];
}
