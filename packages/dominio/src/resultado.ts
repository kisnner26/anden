/** resultado de una operación que puede fallar de forma esperada; los errores esperados no se lanzan */
export type Resultado<T, E> = { ok: true; valor: T } | { ok: false; error: E };

export function ok<T>(valor: T): Resultado<T, never> {
  return { ok: true, valor };
}

export function error<E>(error: E): Resultado<never, E> {
  return { ok: false, error };
}
