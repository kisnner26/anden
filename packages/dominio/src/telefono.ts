const PREFIJO_PAIS = '505';
const LARGO_NACIONAL = 8;

/** los teléfonos de Nicaragua empiezan en 2 (fijos), 5, 7 u 8 (celulares) */
const PRIMER_DIGITO = /^[2578]/;

/**
 * los 8 dígitos nacionales de un teléfono de Nicaragua, o nulo si no lo es; acepta espacios,
 * guiones, paréntesis y el prefijo +505 o 505
 */
export function digitosTelefonoNi(texto: string): string | null {
  let digitos = texto.replace(/[\s\-()]/g, '');
  if (digitos.startsWith('+')) digitos = digitos.slice(1);
  if (digitos.startsWith(PREFIJO_PAIS) && digitos.length > LARGO_NACIONAL) {
    digitos = digitos.slice(PREFIJO_PAIS.length);
  }
  if (!/^\d+$/.test(digitos)) return null;
  if (digitos.length !== LARGO_NACIONAL) return null;
  return PRIMER_DIGITO.test(digitos) ? digitos : null;
}

export function telefonoNiValido(texto: string): boolean {
  return digitosTelefonoNi(texto) !== null;
}

/** el teléfono como se muestra: +505 8888 1234; nulo si no es válido */
export function formatearTelefonoNi(texto: string): string | null {
  const digitos = digitosTelefonoNi(texto);
  if (digitos === null) return null;
  return `+${PREFIJO_PAIS} ${digitos.slice(0, 4)} ${digitos.slice(4)}`;
}
