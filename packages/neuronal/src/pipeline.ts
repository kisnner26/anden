import {
  entrenar,
  type InfoEpoca,
  type OpcionesEntrenamiento,
} from './entrenar.ts';
import { evaluar, matrizDeConfusion, precisionPorClase } from './evaluar.ts';
import { aModelo, type Modelo } from './modelo.ts';
import { contarParametros, crearRed, type Red } from './red.ts';
import { vectorizar } from './vectorizar.ts';

/** una frase con la clase a la que pertenece */
export interface Frase {
  etiqueta: string;
  texto: string;
}

export interface OpcionesClasificador extends OpcionesEntrenamiento {
  dimension?: number;
  ocultas?: number[];
}

export interface ResultadoClasificador {
  etiquetas: string[];
  historial: InfoEpoca[];
  matriz: number[][];
  modelo: Modelo;
  parametros: number;
  precision: number;
  precisionPorClase: (number | null)[];
  red: Red;
}

/** las etiquetas distintas, en orden alfabético para que el modelo no dependa del orden de las frases */
export function etiquetasDe(frases: readonly Frase[]): string[] {
  return [...new Set(frases.map((f) => f.etiqueta))].sort();
}

/**
 * entrena una red que reconoce de qué trata una frase: vectoriza los textos, entrena con una parte y mide con otra,
 * y devuelve el modelo listo para guardar junto con las medidas para ver qué tan bien quedó
 */
export function entrenarClasificador(
  frases: readonly Frase[],
  { dimension = 512, ocultas = [32], ...resto }: OpcionesClasificador = {},
): ResultadoClasificador {
  const etiquetas = etiquetasDe(frases);
  const ejemplos = frases.map((f) => ({
    clase: etiquetas.indexOf(f.etiqueta),
    entrada: vectorizar(f.texto, dimension),
  }));
  const red = crearRed(
    dimension,
    ocultas,
    etiquetas.length,
    resto.semilla ?? 7,
  );
  const historial = entrenar(red, ejemplos, { validacion: 0.2, ...resto });
  const total = evaluar(red, ejemplos);
  const matriz = matrizDeConfusion(red, ejemplos, etiquetas.length);
  const ultima = historial[historial.length - 1];
  const modelo = aModelo(red, etiquetas, dimension, {
    ejemplos: frases.length,
    entrenadoEn: new Date().toISOString(),
    precisionValidacion: ultima?.precisionValidacion ?? null,
  });
  return {
    etiquetas,
    historial,
    matriz,
    modelo,
    parametros: contarParametros(red),
    precision: total.precision,
    precisionPorClase: precisionPorClase(matriz),
    red,
  };
}
