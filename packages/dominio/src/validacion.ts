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

/** la fecha de nacimiento que va dentro de la cédula (DDMMAA) tiene que existir en el calendario */
function fechaDeCedulaPosible(ddmmaa: string): boolean {
  const dia = Number(ddmmaa.slice(0, 2));
  const mes = Number(ddmmaa.slice(2, 4));
  const anio = Number(ddmmaa.slice(4, 6));
  if (mes < 1 || mes > 12 || dia < 1) return false;
  // el siglo no está en la cédula; si algún siglo da una fecha real, se acepta
  return [1900 + anio, 2000 + anio].some(
    (completo) => dia <= new Date(completo, mes, 0).getDate(),
  );
}

/** cédula nicaragüense obligatoria: 001-010190-0001A, con una fecha de nacimiento posible adentro */
export function cedulaValida(texto: string): boolean {
  const limpio = texto.trim().toUpperCase();
  if (!CEDULA_NI.test(limpio)) return false;
  return fechaDeCedulaPosible(limpio.slice(4, 10));
}

/** ordena lo que se escribe en el formato de la cédula: letras y números, en mayúscula, con sus guiones */
export function formatearCedula(texto: string): string {
  const base = texto.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const partes = [
    base.slice(0, 3),
    base.slice(3, 9),
    base.slice(9, 13),
    base.slice(13, 14),
  ];
  // la letra va pegada a los últimos cuatro dígitos
  const [a, b, c, d] = partes;
  return [a, b, `${c ?? ''}${d ?? ''}`].filter((p) => p !== '').join('-');
}
