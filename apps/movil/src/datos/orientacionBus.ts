import { distanciaKm, type Punto } from './busSimulado';

export interface OrientacionBus {
  /** el bus avanza hacia el oeste: el dibujo se espeja para que mire hacia donde va */
  haciaElOeste: boolean;
  /** grados que se inclina el dibujo: positivo es en sentido horario */
  inclinacion: number;
}

const INCLINACION_MAXIMA = 22;
/** cuántos puntos hacia adelante se mira para suavizar las curvas del trazo */
const PUNTOS_ADELANTE = 4;

/** el índice del punto del trazo más cercano al bus */
function indiceMasCercano(trazo: readonly Punto[], bus: Punto): number {
  let mejor = 0;
  let menor = Infinity;
  trazo.forEach((punto, i) => {
    const d = distanciaKm(punto, bus);
    if (d < menor) {
      menor = d;
      mejor = i;
    }
  });
  return mejor;
}

/**
 * hacia dónde mira el bus según el camino que sigue (el trazo va de la terminal de origen a la de destino).
 * El dibujo es de perfil, así que solo se decide si mira a la izquierda o a la derecha y cuánto sube
 * o baja el frente según la pendiente del rumbo en el mapa.
 */
export function orientacionBus(
  trazo: readonly Punto[],
  bus: Punto,
): OrientacionBus {
  if (trazo.length < 2) return { haciaElOeste: false, inclinacion: 0 };
  const desde = Math.min(indiceMasCercano(trazo, bus), trazo.length - 2);
  const hasta = Math.min(trazo.length - 1, desde + PUNTOS_ADELANTE);
  const a = trazo[desde]!;
  const b = trazo[hasta]!;
  const dx = (b.lng - a.lng) * Math.cos((a.lat * Math.PI) / 180);
  const dy = b.lat - a.lat;
  const haciaElOeste = dx < 0;
  // inclinación del rumbo sobre la horizontal; hacia el norte el frente sube
  const rumbo = (Math.atan2(dy, Math.abs(dx)) * 180) / Math.PI;
  const limitado = Math.max(
    -INCLINACION_MAXIMA,
    Math.min(INCLINACION_MAXIMA, rumbo),
  );
  // mirando al este el frente sube girando en sentido antihorario; mirando al oeste, en horario
  return {
    haciaElOeste,
    inclinacion: Math.round(haciaElOeste ? limitado : -limitado) || 0,
  };
}
