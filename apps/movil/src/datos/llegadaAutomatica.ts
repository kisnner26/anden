import type { ProgresoViaje } from './progresoViaje';

/** a esta distancia o menos del final del trazo se considera que el bus llegó */
export const KM_DE_LLEGADA = 0.25;
/** y con este margen de tiempo según la estimación del viaje */
export const MINUTOS_DE_LLEGADA = 2;
/** tiene que mantenerse así este rato para no cerrar por un salto de GPS ni por pasar rozando el destino */
export const SEGUNDOS_PARA_CONFIRMAR = 45;

export interface EstadoLlegada {
  /** desde cuándo (ms) se cumple la llegada sin interrupción; nulo si no se cumple */
  desde: number | null;
  llego: boolean;
}

export const LLEGADA_INICIAL: EstadoLlegada = { desde: null, llego: false };

/** si la posición ya está en el destino marcado en el mapa: cerca del final del trazo, dentro de la ruta y con la estimación a punto de cumplirse */
export function enElDestino(progreso: ProgresoViaje | null): boolean {
  if (!progreso || progreso.fueraDeRuta) return false;
  return (
    progreso.kmRestantes <= KM_DE_LLEGADA &&
    progreso.minutosRestantes <= MINUTOS_DE_LLEGADA
  );
}

/**
 * va siguiendo la llegada: empieza a contar cuando el bus queda en el destino, se reinicia si se aleja
 * o se pierde la señal, y confirma la llegada cuando se mantiene el tiempo necesario
 */
export function seguirLlegada(
  previo: EstadoLlegada,
  progreso: ProgresoViaje | null,
  ahoraMs: number,
  conSenal = true,
): EstadoLlegada {
  if (previo.llego) return previo;
  if (!conSenal || !enElDestino(progreso)) return LLEGADA_INICIAL;
  const desde = previo.desde ?? ahoraMs;
  return {
    desde,
    llego: ahoraMs - desde >= SEGUNDOS_PARA_CONFIRMAR * 1000,
  };
}
