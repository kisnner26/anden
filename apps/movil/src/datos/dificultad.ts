import type { SenalDeAyuda } from './senalesDeAyuda';

/** cuánto pesa cada señal: un toque repetido o un ingreso fallido dicen más que un campo mal escrito */
export const PESOS: Readonly<Record<SenalDeAyuda, number>> = {
  errorFormulario: 1,
  errorIngreso: 2,
  reservaFallida: 2,
  sinConexion: 1,
  toquesRepetidos: 3,
};

/** las señales cuentan mientras sean de hace menos que esto */
export const VENTANA_MS = 90_000;
/** a partir de este puntaje se considera que la persona está trabada */
export const UMBRAL = 3;
/** después de asomarse espera esto antes de volver a hacerlo, para no ser pesada */
export const ENFRIAMIENTO_MS = 5 * 60_000;

export interface EstadoDificultad {
  señales: readonly { en: number; tipo: SenalDeAyuda }[];
  ultimaAsomada: number | null;
}

export const DIFICULTAD_INICIAL: EstadoDificultad = {
  señales: [],
  ultimaAsomada: null,
};

export interface ResultadoSenal {
  /** la señal que más pesó; sirve para saber en qué ayudar */
  asomar: SenalDeAyuda | null;
  estado: EstadoDificultad;
}

/**
 * suma una señal a las recientes y dice si ya es momento de asomarse: el puntaje de la ventana llega al umbral y no se
 * asomó hace poco
 */
export function registrarSenal(
  previo: EstadoDificultad,
  tipo: SenalDeAyuda,
  ahora: number,
): ResultadoSenal {
  const recientes = [...previo.señales, { en: ahora, tipo }].filter(
    (senal) => ahora - senal.en <= VENTANA_MS,
  );
  const puntaje = recientes.reduce((suma, s) => suma + PESOS[s.tipo], 0);
  const enfriando =
    previo.ultimaAsomada !== null &&
    ahora - previo.ultimaAsomada < ENFRIAMIENTO_MS;
  if (puntaje < UMBRAL || enfriando) {
    return { asomar: null, estado: { ...previo, señales: recientes } };
  }
  const principal = recientes.reduce((mejor, s) =>
    PESOS[s.tipo] > PESOS[mejor.tipo] ? s : mejor,
  );
  return {
    asomar: principal.tipo,
    estado: { señales: [], ultimaAsomada: ahora },
  };
}

export interface Toque {
  en: number;
  x: number;
  y: number;
}

/** cuántos toques seguidos en el mismo lugar se consideran golpear una pantalla que no responde */
export const TOQUES_REPETIDOS = 6;
export const VENTANA_TOQUES_MS = 1600;
export const RADIO_TOQUES = 55;

/** agrega un toque y dice si ya son varios, rápidos y en el mismo lugar */
export function registrarToque(
  previos: readonly Toque[],
  nuevo: Toque,
): { repetidos: boolean; toques: Toque[] } {
  const toques = [...previos, nuevo].filter(
    (t) => nuevo.en - t.en <= VENTANA_TOQUES_MS,
  );
  const juntos = toques.filter(
    (t) => Math.hypot(t.x - nuevo.x, t.y - nuevo.y) <= RADIO_TOQUES,
  );
  const repetidos = juntos.length >= TOQUES_REPETIDOS;
  return { repetidos, toques: repetidos ? [] : toques };
}
