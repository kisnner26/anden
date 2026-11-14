export interface MuestraAcelerometro {
  /** aceleración en g en cada eje */
  x: number;
  y: number;
  z: number;
  /** marca de tiempo en milisegundos */
  t: number;
}

/** una lectura de velocidad del GPS */
export interface MuestraVelocidad {
  /** metros por segundo; nunca negativa */
  mps: number;
  /** marca de tiempo en milisegundos */
  t: number;
}

/*
 * Cómo se decide. Un solo número de aceleración no sirve: un teléfono que se cae, un portazo o un bache
 * dan picos tan altos como un choque. Los sistemas de detección de choques de los teléfonos (Crash
 * Detection de Apple, Car Crash Detection de Pixel) combinan varias señales en vez de fiarse de una;
 * aquí se usan las tres que tiene la app:
 *   1. un golpe que dure: un choque mantiene la aceleración alta varias decenas de milisegundos,
 *      un bache o una caída son un pico de uno o dos instantes;
 *   2. que el vehículo fuera en marcha antes del golpe (velocidad del GPS);
 *   3. que después del golpe el vehículo se haya detenido de golpe.
 * Sin GPS se pide un golpe mucho más fuerte y que después haya quietud.
 */

/** la aceleración dinámica (sin la gravedad) a partir de la cual un instante cuenta como "golpe" */
export const UMBRAL_CHOQUE_G = 3;
/** con esta aceleración dinámica una muestra cuenta dentro del impulso sostenido */
export const UMBRAL_IMPULSO_G = 1.5;
/** cuántas muestras seguidas por encima del umbral de impulso hacen falta (a 100 Hz son 30 ms) */
export const MUESTRAS_DE_IMPULSO = 3;
/** sin GPS el golpe tiene que ser más fuerte y más largo */
export const UMBRAL_SIN_GPS_G = 6;
export const MUESTRAS_SIN_GPS = 4;
/** velocidad con la que se considera que el bus iba en marcha: 25 km/h */
export const VELOCIDAD_EN_MARCHA_MPS = 6.9;
/** velocidad con la que se considera que el bus ya se detuvo: 8 km/h */
export const VELOCIDAD_DETENIDO_MPS = 2.2;
/** cuánto de la velocidad previa tiene que haberse perdido para contar como parada brusca */
export const CAIDA_DE_VELOCIDAD = 0.7;
/** qué tan atrás se mira la velocidad previa al golpe */
export const VENTANA_PREVIA_MS = 10_000;
/** cuánto después del golpe se empieza a mirar la velocidad: el GPS tarda en reflejarla */
export const ESPERA_VELOCIDAD_MS = 2000;
/** si pasado este tiempo el GPS no dio ninguna lectura nueva, se decide solo con el golpe */
export const LIMITE_ESPERA_MS = 10_000;
/** sin GPS: el teléfono tiene que quedarse casi quieto este tiempo después del golpe */
const VENTANA_QUIETUD_MS = 1500;
const QUIETUD_G = 0.5;
/** cuánto historial de muestras conviene guardar */
export const VENTANA_HISTORIAL_MS = 15_000;

/** la fuerza total en g, sin importar hacia dónde apunte el teléfono */
export function fuerzaG(m: Pick<MuestraAcelerometro, 'x' | 'y' | 'z'>): number {
  return Math.sqrt(m.x * m.x + m.y * m.y + m.z * m.z);
}

/** la aceleración sin la gravedad: 0 con el teléfono quieto */
export function aceleracionDinamica(
  m: Pick<MuestraAcelerometro, 'x' | 'y' | 'z'>,
): number {
  return Math.abs(fuerzaG(m) - 1);
}

export type ResultadoChoque =
  /** no hay nada que parezca un choque */
  | { estado: 'ninguno' }
  /** hubo un golpe que podría serlo y falta ver qué pasó después */
  | { estado: 'pendiente' }
  | { estado: 'choque'; motivo: 'frenada-brusca' | 'golpe-muy-fuerte' };

interface Impulso {
  /** cuándo fue el pico */
  t: number;
  pico: number;
  /** la racha más larga de muestras seguidas por encima del umbral de impulso */
  racha: number;
}

/** busca golpes sostenidos: un pico alto rodeado de varias muestras altas */
function impulsos(muestras: readonly MuestraAcelerometro[]): Impulso[] {
  const encontrados: Impulso[] = [];
  let i = 0;
  while (i < muestras.length) {
    const actual = muestras[i];
    if (!actual || aceleracionDinamica(actual) < UMBRAL_IMPULSO_G) {
      i += 1;
      continue;
    }
    let racha = 0;
    let pico = 0;
    let tPico = actual.t;
    let j = i;
    while (j < muestras.length) {
      const m = muestras[j];
      if (!m) break;
      const din = aceleracionDinamica(m);
      if (din < UMBRAL_IMPULSO_G) break;
      racha += 1;
      if (din > pico) {
        pico = din;
        tPico = m.t;
      }
      j += 1;
    }
    if (pico >= UMBRAL_CHOQUE_G) encontrados.push({ pico, racha, t: tPico });
    i = j;
  }
  return encontrados;
}

function velocidadMaxima(
  velocidades: readonly MuestraVelocidad[],
  desde: number,
  hasta: number,
): number | null {
  const enVentana = velocidades.filter((v) => v.t >= desde && v.t <= hasta);
  if (enVentana.length === 0) return null;
  return Math.max(...enVentana.map((v) => v.mps));
}

function decidirUno(
  golpe: Impulso,
  muestras: readonly MuestraAcelerometro[],
  velocidades: readonly MuestraVelocidad[],
  ahora: number,
): ResultadoChoque {
  const previa = velocidadMaxima(
    velocidades,
    golpe.t - VENTANA_PREVIA_MS,
    golpe.t,
  );

  if (previa === null) {
    // sin GPS: solo cuenta un golpe muy fuerte y largo, seguido de quietud
    if (golpe.pico < UMBRAL_SIN_GPS_G || golpe.racha < MUESTRAS_SIN_GPS) {
      return { estado: 'ninguno' };
    }
    const despues = muestras.filter(
      (m) => m.t > golpe.t + 200 && m.t <= golpe.t + VENTANA_QUIETUD_MS,
    );
    if (despues.length < 5) {
      return ahora < golpe.t + VENTANA_QUIETUD_MS
        ? { estado: 'pendiente' }
        : { estado: 'ninguno' };
    }
    return despues.every((m) => aceleracionDinamica(m) <= QUIETUD_G)
      ? { estado: 'choque', motivo: 'golpe-muy-fuerte' }
      : { estado: 'ninguno' };
  }

  // con GPS: tiene que ser un impulso sostenido y el bus tiene que haber ido en marcha
  if (golpe.racha < MUESTRAS_DE_IMPULSO) return { estado: 'ninguno' };
  if (previa < VELOCIDAD_EN_MARCHA_MPS) return { estado: 'ninguno' };

  const despues = velocidades.filter(
    (v) => v.t >= golpe.t + ESPERA_VELOCIDAD_MS,
  );
  if (despues.length === 0) {
    if (ahora < golpe.t + LIMITE_ESPERA_MS) return { estado: 'pendiente' };
    // el GPS no dio nada nuevo: se decide con la fuerza del golpe
    return golpe.pico >= UMBRAL_SIN_GPS_G
      ? { estado: 'choque', motivo: 'golpe-muy-fuerte' }
      : { estado: 'ninguno' };
  }
  const minima = Math.min(...despues.map((v) => v.mps));
  const seDetuvo =
    minima <= VELOCIDAD_DETENIDO_MPS ||
    minima <= previa * (1 - CAIDA_DE_VELOCIDAD);
  return seDetuvo
    ? { estado: 'choque', motivo: 'frenada-brusca' }
    : { estado: 'ninguno' };
}

/**
 * decide si lo que pasó en las últimas muestras es un choque. Recibe las muestras en orden, de más
 * vieja a más nueva, y `ahora` en milisegundos; devuelve "pendiente" mientras falta ver qué hizo el
 * vehículo después del golpe.
 */
export function evaluarChoque(
  muestras: readonly MuestraAcelerometro[],
  velocidades: readonly MuestraVelocidad[],
  ahora: number,
): ResultadoChoque {
  let pendiente = false;
  for (const golpe of impulsos(muestras)) {
    const resultado = decidirUno(golpe, muestras, velocidades, ahora);
    if (resultado.estado === 'choque') return resultado;
    if (resultado.estado === 'pendiente') pendiente = true;
  }
  return pendiente ? { estado: 'pendiente' } : { estado: 'ninguno' };
}

/** los segundos que tiene la persona para decir que está bien antes de avisar */
export const SEGUNDOS_PARA_CONFIRMAR = 20;

/** el número al que se ofrece llamar; en Nicaragua la Policía Nacional atiende el 118 */
export const NUMERO_EMERGENCIA = '118';

export interface DatosAlerta {
  lat: number | null;
  lng: number | null;
  /** el nombre de quien viaja */
  nombre: string;
  viajeId: string | null;
}

/** el mensaje para el contacto de emergencia, con un enlace al mapa si hay ubicación */
export function mensajeDeAlerta(datos: DatosAlerta): string {
  const lugar =
    datos.lat !== null && datos.lng !== null
      ? ` Su ubicación: https://maps.apple.com/?ll=${datos.lat.toFixed(5)},${datos.lng.toFixed(5)}`
      : ' No se pudo obtener la ubicación.';
  return `ALERTA de Andén: ${datos.nombre} pudo haber sufrido un accidente en el bus y no respondió a tiempo.${lugar} Llamalo o avisá a emergencias.`;
}
