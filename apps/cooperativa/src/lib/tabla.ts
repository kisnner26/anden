export type Sentido = 'asc' | 'desc';

/** compara dos valores de columna: números como números, fechas ISO y textos sin importar tildes ni mayúsculas */
export function comparar(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined || a === '') return 1;
  if (b === null || b === undefined || b === '') return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'es', {
    numeric: true,
    sensitivity: 'base',
  });
}

export function ordenar<T>(
  filas: readonly T[],
  valor: (fila: T) => unknown,
  sentido: Sentido,
): T[] {
  const signo = sentido === 'asc' ? 1 : -1;
  return [...filas].sort((x, y) => signo * comparar(valor(x), valor(y)));
}

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** las filas cuyo texto contiene todas las palabras buscadas, sin importar tildes ni mayúsculas */
export function buscar<T>(
  filas: readonly T[],
  texto: (fila: T) => string,
  consulta: string,
): T[] {
  const palabras = sinTildes(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return [...filas];
  return filas.filter((fila) => {
    const contenido = sinTildes(texto(fila));
    return palabras.every((palabra) => contenido.includes(palabra));
  });
}

export function paginar<T>(
  filas: readonly T[],
  pagina: number,
  tamano: number,
): T[] {
  return filas.slice(pagina * tamano, pagina * tamano + tamano);
}

export function totalPaginas(total: number, tamano: number): number {
  return Math.max(1, Math.ceil(total / tamano));
}
