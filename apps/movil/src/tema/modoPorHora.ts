/** hora a partir de la cual la app pasa al modo oscuro */
export const HORA_INICIO_NOCHE = 18;
/** hora a partir de la cual la app vuelve al modo claro */
export const HORA_FIN_NOCHE = 6;

export type ModoAutomatico = 'claro' | 'oscuro';

/** oscuro de las 18:00 a las 05:59, claro el resto del día */
export function modoPorHora(fecha: Date): ModoAutomatico {
  const hora = fecha.getHours();
  return hora >= HORA_INICIO_NOCHE || hora < HORA_FIN_NOCHE
    ? 'oscuro'
    : 'claro';
}
