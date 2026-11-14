/** los tamaños a los que se puede acercar el plano del bus, de menor a mayor */
export const NIVELES_DE_ZOOM = [1, 1.3, 1.6] as const;

export interface Toque {
  pageX: number;
  pageY: number;
}

/** la distancia entre dos dedos; 0 si no hay dos toques */
export function distanciaEntreToques(toques: readonly Toque[]): number {
  const [a, b] = toques;
  if (!a || !b) return 0;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

/**
 * cuánto acercar o alejar al pellizcar: si los dedos se separaron un cuarto o más sube un nivel y si se
 * juntaron un quinto o más baja uno; entre medio no cambia
 */
export function nivelDespuesDePellizcar(
  nivel: number,
  distanciaInicial: number,
  distanciaActual: number,
): number {
  if (distanciaInicial <= 0 || distanciaActual <= 0) return nivel;
  const razon = distanciaActual / distanciaInicial;
  const maximo = NIVELES_DE_ZOOM.length - 1;
  if (razon >= 1.25) return Math.min(maximo, nivel + 1);
  if (razon <= 0.8) return Math.max(0, nivel - 1);
  return nivel;
}
