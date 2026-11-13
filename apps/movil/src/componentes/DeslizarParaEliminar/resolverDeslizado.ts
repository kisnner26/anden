/** lo ancho que queda la acción al abrirla a medias */
export const ANCHO_ACCION = 92;
const MITAD = 0.5;

export type ResultadoDeslizado = 'abrir' | 'cerrar' | 'eliminar';

/**
 * qué hacer al soltar: un deslizado largo elimina, uno corto deja ver la acción y el resto vuelve;
 * `desplazamiento` es lo que se movió el contenido (negativo hacia la izquierda)
 */
export function resolverDeslizado(
  desplazamiento: number,
  ancho: number,
): ResultadoDeslizado {
  if (ancho > 0 && desplazamiento <= -ancho * MITAD) return 'eliminar';
  if (desplazamiento <= -ANCHO_ACCION / 2) return 'abrir';
  return 'cerrar';
}

/** el contenido solo se mueve a la izquierda y no más allá del ancho */
export function limitarDeslizado(
  desplazamiento: number,
  ancho: number,
): number {
  return Math.min(0, Math.max(desplazamiento, -Math.max(ancho, 0)));
}
