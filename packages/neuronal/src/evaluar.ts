import { avanzar, type Red } from './red';

/** un ejemplo para entrenar o evaluar: la entrada ya vectorizada y el número de su clase */
export interface Ejemplo {
  clase: number;
  entrada: Float32Array;
}

export interface Evaluacion {
  perdida: number;
  precision: number;
}

/** el índice de la probabilidad más alta */
export function indiceMayor(valores: Float32Array): number {
  let mejor = 0;
  for (let i = 1; i < valores.length; i += 1) {
    if ((valores[i] as number) > (valores[mejor] as number)) mejor = i;
  }
  return mejor;
}

/** la pérdida (entropía cruzada media) y la precisión de la red sobre unos ejemplos */
export function evaluar(red: Red, ejemplos: readonly Ejemplo[]): Evaluacion {
  if (ejemplos.length === 0) return { perdida: 0, precision: 0 };
  let perdida = 0;
  let aciertos = 0;
  for (let i = 0; i < ejemplos.length; i += 1) {
    const ejemplo = ejemplos[i] as Ejemplo;
    const p = avanzar(red, ejemplo.entrada).probabilidades;
    perdida -= Math.log(Math.max(p[ejemplo.clase] as number, 1e-12));
    if (indiceMayor(p) === ejemplo.clase) aciertos += 1;
  }
  return { perdida: perdida / ejemplos.length, precision: aciertos / ejemplos.length };
}

/** cuántas veces la red confundió cada clase real con cada clase predicha: filas = real, columnas = predicha */
export function matrizDeConfusion(
  red: Red,
  ejemplos: readonly Ejemplo[],
  clases: number,
): number[][] {
  const matriz = Array.from({ length: clases }, () => new Array<number>(clases).fill(0));
  for (let i = 0; i < ejemplos.length; i += 1) {
    const ejemplo = ejemplos[i] as Ejemplo;
    const predicha = indiceMayor(avanzar(red, ejemplo.entrada).probabilidades);
    const fila = matriz[ejemplo.clase] as number[];
    fila[predicha] = (fila[predicha] as number) + 1;
  }
  return matriz;
}

/** la precisión de cada clase: de los ejemplos reales de esa clase, cuántos acertó; nulo si no hay ninguno */
export function precisionPorClase(matriz: readonly number[][]): (number | null)[] {
  return matriz.map((fila, i) => {
    let total = 0;
    for (let j = 0; j < fila.length; j += 1) total += fila[j] as number;
    return total === 0 ? null : (fila[i] as number) / total;
  });
}
