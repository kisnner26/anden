/** un generador de números entre 0 y 1 que repite la misma serie con la misma semilla; así un entrenamiento se puede repetir */
export function crearAzar(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** un número con distribución normal (media 0, desviación 1) a partir del generador */
export function normal(azar: () => number): number {
  const u = Math.max(azar(), 1e-12);
  const v = azar();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** mezcla una lista con el generador, sin cambiar la original */
export function mezclar<T>(lista: readonly T[], azar: () => number): T[] {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(azar() * (i + 1));
    const temporal = copia[i] as T;
    copia[i] = copia[j] as T;
    copia[j] = temporal;
  }
  return copia;
}
