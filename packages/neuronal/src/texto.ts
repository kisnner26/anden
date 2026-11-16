/** minúsculas, sin tildes y con un solo espacio entre palabras: así "¿Cuánto cuesta?" y "cuanto cuesta" son lo mismo */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** las palabras de un texto ya normalizado */
export function palabras(texto: string): string[] {
  const limpio = normalizar(texto);
  return limpio === '' ? [] : limpio.split(' ');
}

/**
 * los rasgos de un texto: cada palabra, cada par de palabras seguidas y cada trozo de tres letras. Los trozos
 * permiten reconocer "boacoo" o "mañna" aunque la persona escriba mal.
 */
export function rasgos(texto: string): string[] {
  const lista = palabras(texto);
  const salida: string[] = [];
  for (let i = 0; i < lista.length; i += 1) {
    const palabra = lista[i] as string;
    salida.push(`p:${palabra}`);
    if (i + 1 < lista.length)
      salida.push(`b:${palabra}_${lista[i + 1] as string}`);
    const marcada = `^${palabra}$`;
    for (let j = 0; j + 3 <= marcada.length; j += 1) {
      salida.push(`c:${marcada.slice(j, j + 3)}`);
    }
  }
  return salida;
}
