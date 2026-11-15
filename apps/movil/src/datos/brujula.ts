import {
  diferenciaDeRumbo,
  distanciaM,
  rumboGrados,
  type Coordenada,
} from './geometria';

/** a esta distancia ya se considera que se llegó al punto */
export const METROS_DE_LLEGADA = 20;

export interface EstadoDeLaBrujula {
  distanciaM: number;
  /** cuánto hay que girar para mirar al punto: de -180 a 180, positivo hacia la derecha */
  giro: number;
  llego: boolean;
  /** hacia dónde queda el punto, en grados desde el norte */
  rumbo: number;
}

/** con dónde estás, dónde está el punto y hacia dónde mira el teléfono: cuánto falta y hacia qué lado girar */
export function estadoDeLaBrujula(
  posicion: Coordenada,
  punto: Coordenada,
  haciaDondeMira: number,
): EstadoDeLaBrujula {
  const distancia = distanciaM(posicion, punto);
  const rumbo = rumboGrados(posicion, punto);
  return {
    distanciaM: distancia,
    giro: diferenciaDeRumbo(haciaDondeMira, rumbo),
    llego: distancia <= METROS_DE_LLEGADA,
    rumbo,
  };
}

/** la distancia como se dice en voz alta: en metros si es poca y en kilómetros con un decimal si es mucha */
export function distanciaLegible(metros: number): string {
  if (metros < 1000) return `${Math.max(5, Math.round(metros / 5) * 5)} m`;
  return `${(metros / 1000).toFixed(1)} km`;
}
