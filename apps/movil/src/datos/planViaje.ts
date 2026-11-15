export type ClaveDePaso = 'anden' | 'casa' | 'llegada' | 'salida';

export interface PasoDelPlan {
  clave: ClaveDePaso;
  hora: Date;
}

/** con cuánta anticipación hay que estar en el punto de encuentro antes de la salida */
export const MINUTOS_EN_EL_ANDEN = 15;
/** el margen de sobra para salir de casa sin ir corriendo */
export const MARGEN_DE_SALIDA_MIN = 10;
/** más lejos que esto ya no se está en la misma ciudad de la terminal y no se calcula cuándo salir de casa */
export const METROS_MAXIMOS_A_LA_TERMINAL = 40_000;

/** cuánto se tarda en llegar a la terminal desde una distancia en línea recta: se agranda por las calles y se supone tráfico de ciudad */
export function minutosHastaLaTerminal(metros: number): number {
  const kilometrosDeCalle = (metros * 1.3) / 1000;
  return Math.max(3, Math.ceil((kilometrosDeCalle / 22) * 60));
}

/**
 * los pasos de un viaje con su hora: salir de casa (solo si se sabe a qué distancia está la terminal), estar en el punto de
 * encuentro, la salida y la llegada estimada
 */
export function planDelViaje(
  salida: Date,
  duracionMin: number,
  metrosALaTerminal: number | null,
): PasoDelPlan[] {
  const minuto = 60_000;
  const anden = new Date(salida.getTime() - MINUTOS_EN_EL_ANDEN * minuto);
  const pasos: PasoDelPlan[] = [];
  if (
    metrosALaTerminal !== null &&
    metrosALaTerminal <= METROS_MAXIMOS_A_LA_TERMINAL
  ) {
    const camino = minutosHastaLaTerminal(metrosALaTerminal);
    pasos.push({
      clave: 'casa',
      hora: new Date(
        anden.getTime() - (camino + MARGEN_DE_SALIDA_MIN) * minuto,
      ),
    });
  }
  pasos.push(
    { clave: 'anden', hora: anden },
    { clave: 'salida', hora: salida },
    {
      clave: 'llegada',
      hora: new Date(salida.getTime() + duracionMin * minuto),
    },
  );
  return pasos;
}

/** el primer paso que todavía no llegó, para resaltarlo; nulo si ya pasaron todos */
export function pasoSiguiente(
  pasos: readonly PasoDelPlan[],
  ahora: Date,
): ClaveDePaso | null {
  return pasos.find((p) => p.hora.getTime() > ahora.getTime())?.clave ?? null;
}
