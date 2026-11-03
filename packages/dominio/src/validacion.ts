const LARGO_MINIMO_NOMBRE = 2;
const LARGO_MAXIMO_NOMBRE = 80;

export function nombrePersonaValido(texto: string): boolean {
  const limpio = texto.trim();
  return (
    limpio.length >= LARGO_MINIMO_NOMBRE &&
    limpio.length <= LARGO_MAXIMO_NOMBRE &&
    /^[\p{L}][\p{L}\p{M} .'-]*$/u.test(limpio)
  );
}
