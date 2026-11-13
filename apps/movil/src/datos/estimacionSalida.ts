/**
 * El interlocal no sale a una hora fija: se pone a esperar pasajeros y sale cuando se llena. Esta
 * estimación mezcla dos señales: cuánto tardaron en llenarse los viajes parecidos (mediana) y qué
 * tan rápido se están vendiendo los asientos de este viaje (ritmo).
 */

export interface SalidaRegistrada {
  /** cuántos minutos esperó el bus desde que se puso hasta que salió */
  esperaMin: number;
  /** la hora del día en que se puso, para comparar franjas parecidas */
  horaDeInicio: number;
  rutaId: string;
  servicio: string;
}

/**
 * esperas de referencia por ruta y servicio, en minutos, cargadas a mano con lo que se observa en las
 * terminales. Vacío hasta que haya datos reales: la app no inventa tiempos.
 */
export const REFERENCIA_ESPERA_MIN: Readonly<Record<string, number>> = {};

export interface EntradaEstimacion {
  ahora: Date;
  capacidad: number;
  historial: readonly SalidaRegistrada[];
  ocupados: number;
  /** la hora en que el bus se puso a esperar */
  puestoEn: Date;
  rutaId: string;
  servicio: string;
}

export type BaseEstimacion = 'historial' | 'lleno' | 'mixta' | 'ritmo';

export interface Estimacion {
  base: BaseEstimacion;
  confianza: 'alta' | 'baja' | 'media';
  /** la hora estimada de salida */
  estimada: Date;
  /** de 0 a 1: cuánto del bus ya está vendido */
  llenado: number;
}

const MAXIMA_ESPERA_MIN = 6 * 60;
const MIN_MUESTRAS = 3;

export function mediana(valores: readonly number[]): number | null {
  if (valores.length === 0) return null;
  const orden = [...valores].sort((a, b) => a - b);
  const medio = Math.floor(orden.length / 2);
  return orden.length % 2 === 1
    ? (orden[medio] ?? null)
    : ((orden[medio - 1] ?? 0) + (orden[medio] ?? 0)) / 2;
}

/** la mediana de espera de los viajes de la misma ruta y servicio, o la referencia cargada a mano */
export function esperaTipica(
  historial: readonly SalidaRegistrada[],
  rutaId: string,
  servicio: string,
  horaDeInicio: number,
): { muestras: number; minutos: number } | null {
  const parecidas = historial.filter(
    (salida) => salida.rutaId === rutaId && salida.servicio === servicio,
  );
  // con suficientes datos se prefieren los de una franja cercana del día
  const cercanas = parecidas.filter(
    (salida) => Math.abs(salida.horaDeInicio - horaDeInicio) <= 2,
  );
  const base = cercanas.length >= MIN_MUESTRAS ? cercanas : parecidas;
  const centro = mediana(base.map((salida) => salida.esperaMin));
  if (centro !== null && base.length >= 1) {
    return { minutos: centro, muestras: base.length };
  }
  const referencia = REFERENCIA_ESPERA_MIN[`${rutaId}:${servicio}`];
  return referencia === undefined ? null : { minutos: referencia, muestras: 0 };
}

/** cuándo saldría el bus; nulo si todavía no hay con qué estimarlo */
export function estimarSalida(entrada: EntradaEstimacion): Estimacion | null {
  const { ahora, capacidad, historial, ocupados, puestoEn } = entrada;
  if (capacidad <= 0) return null;
  const llenado = Math.min(1, ocupados / capacidad);
  if (ocupados >= capacidad) {
    return { base: 'lleno', confianza: 'alta', estimada: ahora, llenado: 1 };
  }

  const transcurridos = Math.max(
    1,
    (ahora.getTime() - puestoEn.getTime()) / 60_000,
  );
  const porRitmo =
    ocupados >= 2
      ? ahora.getTime() +
        Math.min(
          MAXIMA_ESPERA_MIN,
          (capacidad - ocupados) / (ocupados / transcurridos),
        ) *
          60_000
      : null;
  const tipica = esperaTipica(
    historial,
    entrada.rutaId,
    entrada.servicio,
    puestoEn.getHours(),
  );
  const porHistorial = tipica
    ? Math.max(ahora.getTime(), puestoEn.getTime() + tipica.minutos * 60_000)
    : null;

  if (porRitmo !== null && porHistorial !== null) {
    // cuanto más lleno va el bus, más pesa el ritmo real sobre la costumbre
    const peso = Math.min(0.85, 0.35 + llenado);
    return {
      base: 'mixta',
      confianza: tipica && tipica.muestras >= MIN_MUESTRAS ? 'alta' : 'media',
      estimada: new Date(porRitmo * peso + porHistorial * (1 - peso)),
      llenado,
    };
  }
  if (porRitmo !== null) {
    return {
      base: 'ritmo',
      confianza: ocupados >= 4 ? 'media' : 'baja',
      estimada: new Date(porRitmo),
      llenado,
    };
  }
  if (porHistorial !== null) {
    return {
      base: 'historial',
      confianza: tipica && tipica.muestras >= MIN_MUESTRAS ? 'media' : 'baja',
      estimada: new Date(porHistorial),
      llenado,
    };
  }
  return null;
}
