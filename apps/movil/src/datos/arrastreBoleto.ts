/** cuánto hay que arrastrar hacia arriba para que el boleto quede del todo grande */
export const DISTANCIA_ARRASTRE = 170;
/** a partir de este avance el brillo sube al máximo */
export const AVANCE_PARA_BRILLO = 0.12;

/** el avance del arrastre, de 0 a 1: solo cuenta lo que se sube, nunca lo que se baja */
export function progresoDeArrastre(
  dy: number,
  distancia: number = DISTANCIA_ARRASTRE,
): number {
  if (dy >= 0) return 0;
  return Math.min(1, -dy / distancia);
}

/** ¿el gesto es un arrastre vertical hacia arriba, y no un deslizamiento de lado o un toque? */
export function esArrastreHaciaArriba(dx: number, dy: number): boolean {
  return dy < -8 && Math.abs(dy) > Math.abs(dx) * 1.4;
}
