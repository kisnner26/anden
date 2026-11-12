/** fracción del recorrido a partir de la cual soltar completa el deslizamiento */
export const UMBRAL_COMPLETAR = 0.72;

/** tramos de avance que marcan una vibración leve bajo el dedo */
export const MARCAS_VIBRACION = [0.25, 0.5, 0.75] as const;

export type ResultadoSoltado = 'completar' | 'volver';

export function limitarDesplazamiento(dx: number, maximo: number): number {
  if (maximo <= 0) return 0;
  return Math.min(Math.max(dx, 0), maximo);
}

export function resolverSoltado(
  desplazamiento: number,
  maximo: number,
): ResultadoSoltado {
  if (maximo <= 0) return 'volver';
  return desplazamiento / maximo >= UMBRAL_COMPLETAR ? 'completar' : 'volver';
}

/** cuántas marcas de vibración quedaron atrás; sirve para vibrar solo al cruzar una */
export function marcasCruzadas(desplazamiento: number, maximo: number): number {
  if (maximo <= 0) return 0;
  const avance = desplazamiento / maximo;
  return MARCAS_VIBRACION.filter((marca) => avance >= marca).length;
}
