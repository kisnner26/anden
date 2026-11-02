const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const LONGITUD_CUERPO = 7;

function digitoControl(cuerpo: string): number {
  return [...cuerpo].reduce((suma, caracter, indice) => {
    const valor = ALFABETO.indexOf(caracter) + 1;
    return suma + valor * (indice + 1);
  }, 0) % 10;
}

export function generarCodigo(aleatorio: () => number): string {
  const cuerpo = Array.from({ length: LONGITUD_CUERPO }, () => {
    const indice = Math.floor(aleatorio() * ALFABETO.length);
    return ALFABETO[indice] ?? ALFABETO[0];
  }).join('');

  return `${cuerpo}${digitoControl(cuerpo)}`;
}

export function codigoValido(codigo: string): boolean {
  if (!new RegExp(`^[${ALFABETO}]{${LONGITUD_CUERPO}}[0-9]$`).test(codigo)) {
    return false;
  }

  const cuerpo = codigo.slice(0, LONGITUD_CUERPO);
  const control = Number(codigo.at(-1));
  return digitoControl(cuerpo) === control;
}
