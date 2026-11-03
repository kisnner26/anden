import type { Boleto, Calificacion } from './tipos';

const MAXIMO_CALIFICACIONES = 200;
const MINIMO_CALIFICACIONES = 5;

/**
 * promedio del chofer con un decimal, sobre sus últimas 200 calificaciones (la lista va de la más
 * vieja a la más nueva); nulo si tiene menos de 5, para no mostrar una nota con pocas opiniones
 */
export function promedioChofer(calificaciones: Calificacion[]): number | null {
  if (calificaciones.length < MINIMO_CALIFICACIONES) return null;
  const ultimas = calificaciones.slice(-MAXIMO_CALIFICACIONES);
  const suma = ultimas.reduce((total, c) => total + c.estrellas, 0);
  return Math.round((suma / ultimas.length) * 10) / 10;
}

/** se califica una vez por boleto, y solo cuando el viaje ya se hizo */
export function puedeCalificar(
  boleto: Boleto,
  existentes: Calificacion[],
): boolean {
  return (
    boleto.estado === 'usado' &&
    !existentes.some((calificacion) => calificacion.boletoId === boleto.id)
  );
}
