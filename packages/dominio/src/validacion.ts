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

export function correoOpcionalValido(texto: string): boolean {
  const limpio = texto.trim();
  if (limpio === '') return true;
  if (limpio.length > 254 || limpio.includes('..')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(limpio);
}

const CEDULA_NI = /^\d{3}-\d{6}-\d{4}[A-Z]$/;

export function cedulaOpcionalValida(texto: string): boolean {
  const limpio = texto.trim().toUpperCase();
  if (limpio === '') return true;
  return CEDULA_NI.test(limpio);
}
