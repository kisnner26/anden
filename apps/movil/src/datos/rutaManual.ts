import { distanciaKm, type Punto } from './busSimulado';

/** a qué velocidad media se estima un bus por carretera: para dar un tiempo aproximado entre dos puntos marcados a mano */
export const KM_POR_HORA_MEDIA = 45;

export interface PuntosManuales {
  a: Punto | null;
  b: Punto | null;
}

export const SIN_PUNTOS: PuntosManuales = { a: null, b: null };

/**
 * cada toque en el mapa: el primero marca A, el segundo marca B y un tercero empieza de nuevo desde A; así se puede
 * armar un tramo de punto a punto sin menús
 */
export function marcarPunto(
  previos: PuntosManuales,
  tocado: Punto,
): PuntosManuales {
  if (previos.a === null) return { a: tocado, b: null };
  if (previos.b === null) return { a: previos.a, b: tocado };
  return { a: tocado, b: null };
}

/** cambia de lugar A y B */
export function intercambiarPuntos(p: PuntosManuales): PuntosManuales {
  return { a: p.b, b: p.a };
}

export interface ResumenTramo {
  km: number;
  minutos: number;
}

/** la distancia en línea recta entre A y B y cuánto tardaría un bus a velocidad media; nulo si falta un punto */
export function resumenDelTramo(p: PuntosManuales): ResumenTramo | null {
  if (!p.a || !p.b) return null;
  // por carretera se recorre algo más que la línea recta
  const km = Math.round(distanciaKm(p.a, p.b) * 1.25 * 10) / 10;
  return {
    km,
    minutos: Math.max(1, Math.round((km / KM_POR_HORA_MEDIA) * 60)),
  };
}
