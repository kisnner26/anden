import { formatoHoraCompleta } from './formato';
import type { Salida } from './salidas';

/** la hora del día en que empieza y termina la línea del día */
export const HORA_INICIO_LINEA = 5;
export const HORA_FIN_LINEA = 23;

/** dónde cae una hora en la línea del día: 0 es el inicio y 1 el final; se queda dentro de esos límites */
export function posicionEnElDia(fecha: Date): number {
  const horas = fecha.getHours() + fecha.getMinutes() / 60;
  const avance =
    (horas - HORA_INICIO_LINEA) / (HORA_FIN_LINEA - HORA_INICIO_LINEA);
  return Math.min(1, Math.max(0, avance));
}

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

export interface GrupoDeFranja {
  franja: FranjaDelDia;
  salidas: Salida[];
}

/** las salidas ordenadas por hora y juntas por momento del día, para dibujarlas por tramos */
export function agruparPorFranja(salidas: readonly Salida[]): GrupoDeFranja[] {
  const grupos: GrupoDeFranja[] = [];
  const ordenadas = [...salidas].sort(
    (a, b) => a.salida.getTime() - b.salida.getTime(),
  );
  for (const salida of ordenadas) {
    const franja = franjaDelDia(salida.salida);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.franja === franja) ultimo.salidas.push(salida);
    else grupos.push({ franja, salidas: [salida] });
  }
  return grupos;
}

/** el alto de la barra de asientos libres, entre un mínimo visible y el máximo; las agotadas quedan en el mínimo */
export function altoDeBarra(
  libres: number,
  maximoLibres: number,
  minimo = 8,
  maximo = 72,
): number {
  if (libres <= 0 || maximoLibres <= 0) return minimo;
  const proporcion = Math.min(1, libres / maximoLibres);
  return Math.round(minimo + (maximo - minimo) * proporcion);
}
