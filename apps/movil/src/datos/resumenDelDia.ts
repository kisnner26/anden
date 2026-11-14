import { formatoHoraCompleta } from './formato';
import type { Salida } from './salidas';

const ACTIVAS: Salida['estado'][] = ['abordando', 'atrasado', 'programado'];

export interface AtajosDelDia {
  /** la de tarifa más baja que todavía tiene asientos */
  masBarata: Salida | null;
  /** la que más asientos libres tiene */
  masLibre: Salida | null;
  /** la primera que sale y tiene asientos */
  masTemprana: Salida | null;
}

/** tres respuestas rápidas con datos reales del día; cada una es nula si no hay salida que la cumpla */
export function atajosDelDia(
  salidas: readonly Salida[],
  ahora: Date,
): AtajosDelDia {
  const utiles = salidas.filter(
    (salida) =>
      ACTIVAS.includes(salida.estado) &&
      salida.asientosLibres > 0 &&
      salida.ventaAbierta &&
      salida.salida.getTime() >= ahora.getTime() - 15 * 60_000,
  );
  const porHora = [...utiles].sort(
    (a, b) => a.salida.getTime() - b.salida.getTime(),
  );
  const conTarifa = porHora.filter((salida) => salida.tarifa !== null);
  const masBarata =
    conTarifa.reduce<Salida | null>(
      (mejor, salida) =>
        mejor === null ||
        (salida.tarifa ?? Infinity) < (mejor.tarifa ?? Infinity)
          ? salida
          : mejor,
      null,
    ) ?? null;
  const masLibre = porHora.reduce<Salida | null>(
    (mejor, salida) =>
      mejor === null || salida.asientosLibres > mejor.asientosLibres
        ? salida
        : mejor,
    null,
  );
  return { masBarata, masLibre, masTemprana: porHora[0] ?? null };
}

/** el texto con las salidas del día que se le da al modelo para que las resuma */
export function contextoDelDia(
  salidas: readonly Salida[],
  terminal: string,
): string {
  const lineas = [...salidas]
    .sort((a, b) => a.salida.getTime() - b.salida.getTime())
    .slice(0, 14)
    .map(
      (salida) =>
        `- ${formatoHoraCompleta(salida.salida)} a ${salida.destino}, ${salida.servicio}, ${
          salida.tarifa === null ? 'sin tarifa' : `C$ ${salida.tarifa}`
        }, ${salida.asientosLibres} asientos libres, ${salida.estado}`,
    );
  return [
    `Salidas desde ${terminal}:`,
    lineas.length > 0 ? lineas.join('\n') : '- ninguna',
  ].join('\n');
}

export type FranjaDelDia = 'madrugada' | 'manana' | 'noche' | 'tarde';

/** en qué momento del día cae una hora: madrugada hasta las 6, mañana hasta el mediodía, tarde hasta las 6 y noche */
export function franjaDelDia(fecha: Date): FranjaDelDia {
  const hora = fecha.getHours();
  if (hora < 6) return 'madrugada';
  if (hora < 12) return 'manana';
  if (hora < 18) return 'tarde';
  return 'noche';
}

/** qué tan llena de asientos libres está una salida respecto de la que más tiene, de 0 a 1 */
export function fraccionDeAsientos(
  libres: number,
  maximoLibres: number,
): number {
  if (libres <= 0 || maximoLibres <= 0) return 0;
  return Math.min(1, libres / maximoLibres);
}
