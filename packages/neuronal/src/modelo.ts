import type { Capa, Red } from './red.ts';

/** un modelo ya entrenado, listo para guardarse en un archivo y cargarse en el teléfono */
export interface Modelo {
  /** cuántas casillas tiene el vector de cada texto */
  dimension: number;
  /** el nombre de cada clase, en el orden de las salidas */
  etiquetas: string[];
  capas: {
    entradas: number;
    pesos: number[];
    salidas: number;
    sesgos: number[];
  }[];
  /** de cuándo es y con qué se entrenó; sirve para saber qué modelo se está usando */
  meta: {
    ejemplos: number;
    entrenadoEn: string;
    precisionValidacion: number | null;
  };
  version: 1;
}

const DECIMALES = 10_000;

function redondear(valor: number): number {
  return Math.round(valor * DECIMALES) / DECIMALES;
}

/** arma el modelo para guardar: redondea a cuatro decimales, que no cambia lo que responde y achica el archivo */
export function aModelo(
  red: Red,
  etiquetas: readonly string[],
  dimension: number,
  meta: Modelo['meta'],
): Modelo {
  return {
    capas: red.capas.map((capa) => ({
      entradas: capa.entradas,
      pesos: Array.from(capa.pesos, redondear),
      salidas: capa.salidas,
      sesgos: Array.from(capa.sesgos, redondear),
    })),
    dimension,
    etiquetas: [...etiquetas],
    meta,
    version: 1,
  };
}

/** la red de un modelo guardado */
export function aRed(modelo: Modelo): Red {
  const capas: Capa[] = modelo.capas.map((capa) => ({
    entradas: capa.entradas,
    pesos: Float32Array.from(capa.pesos),
    salidas: capa.salidas,
    sesgos: Float32Array.from(capa.sesgos),
  }));
  return { capas };
}

function esNumeros(valor: unknown, largo: number): valor is number[] {
  return (
    Array.isArray(valor) &&
    valor.length === largo &&
    valor.every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}

/** lee un modelo de un texto JSON sin confiar en su forma; nulo si algo no cuadra */
export function leerModelo(json: string): Modelo | null {
  let crudo: unknown;
  try {
    crudo = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof crudo !== 'object' || crudo === null) return null;
  const m = crudo as Record<string, unknown>;
  if (
    m.version !== 1 ||
    typeof m.dimension !== 'number' ||
    !Array.isArray(m.etiquetas)
  )
    return null;
  if (
    !m.etiquetas.every((e) => typeof e === 'string') ||
    !Array.isArray(m.capas) ||
    m.capas.length === 0
  )
    return null;
  let anterior = m.dimension;
  for (const capa of m.capas as Record<string, unknown>[]) {
    const { entradas, pesos, salidas, sesgos } = capa;
    if (
      typeof entradas !== 'number' ||
      typeof salidas !== 'number' ||
      entradas !== anterior
    )
      return null;
    if (!esNumeros(pesos, entradas * salidas) || !esNumeros(sesgos, salidas))
      return null;
    anterior = salidas;
  }
  if (anterior !== m.etiquetas.length) return null;
  const meta = (m.meta ?? {}) as Record<string, unknown>;
  return {
    capas: m.capas as Modelo['capas'],
    dimension: m.dimension,
    etiquetas: m.etiquetas as string[],
    meta: {
      ejemplos: typeof meta.ejemplos === 'number' ? meta.ejemplos : 0,
      entrenadoEn: typeof meta.entrenadoEn === 'string' ? meta.entrenadoEn : '',
      precisionValidacion:
        typeof meta.precisionValidacion === 'number'
          ? meta.precisionValidacion
          : null,
    },
    version: 1,
  };
}
