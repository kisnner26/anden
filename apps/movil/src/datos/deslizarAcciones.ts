/** cuánto hay que arrastrar para que la acción se active al soltar */
export const UMBRAL_ACCION = 84;
/** lo máximo que se deja arrastrar la fila */
export const LIMITE_ARRASTRE = 128;

export type LadoAccion = 'derecha' | 'izquierda';

/** el avance de 0 a 1 hacia activar la acción del lado al que se arrastra */
export function avanceDeAccion(desplazamiento: number): number {
  return Math.min(1, Math.abs(desplazamiento) / UMBRAL_ACCION);
}

/** la fila sigue el dedo con un poco de resistencia al pasar el umbral y nunca más allá del límite */
export function limitarArrastre(desplazamiento: number): number {
  const magnitud = Math.abs(desplazamiento);
  const resistida =
    magnitud <= UMBRAL_ACCION
      ? magnitud
      : UMBRAL_ACCION + (magnitud - UMBRAL_ACCION) * 0.35;
  return Math.sign(desplazamiento) * Math.min(resistida, LIMITE_ARRASTRE);
}

/**
 * qué acción se activa al soltar: ninguna si no llegó al umbral; arrastrar a la derecha muestra y activa la
 * acción de la izquierda, y al revés
 */
export function accionAlSoltar(
  desplazamiento: number,
  hayIzquierda: boolean,
  hayDerecha: boolean,
): LadoAccion | null {
  if (Math.abs(desplazamiento) < UMBRAL_ACCION) return null;
  if (desplazamiento > 0 && hayIzquierda) return 'izquierda';
  if (desplazamiento < 0 && hayDerecha) return 'derecha';
  return null;
}
