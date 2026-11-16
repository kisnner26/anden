import { rasgos } from './texto.ts';

/** un número estable (0 a 2^32-1) para un texto: la misma palabra cae siempre en el mismo lugar */
export function hash(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * el texto como un vector de largo fijo: cada rasgo suma en una casilla según su hash, con signo para que dos
 * rasgos que chocan se compensen. Así no hace falta guardar un vocabulario y el modelo pesa poco.
 */
export function vectorizar(texto: string, dimension: number): Float32Array {
  const vector = new Float32Array(dimension);
  const lista = rasgos(texto);
  for (let i = 0; i < lista.length; i += 1) {
    const h = hash(lista[i] as string);
    const casilla = h % dimension;
    vector[casilla] = (vector[casilla] as number) + (h & 0x80000000 ? -1 : 1);
  }
  let norma = 0;
  for (let i = 0; i < dimension; i += 1) norma += (vector[i] as number) ** 2;
  norma = Math.sqrt(norma);
  if (norma > 0) {
    for (let i = 0; i < dimension; i += 1) vector[i] = (vector[i] as number) / norma;
  }
  return vector;
}
