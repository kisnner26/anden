// formato provisional de horas hasta que T-018 lo mueva al dominio con sus pruebas es-NI

/** hora en 12 horas sin sufijo, por ejemplo 2:40 */
export function formatoHora(fecha: Date): string {
  const hora = fecha.getHours() % 12 || 12;
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${hora}:${minutos}`;
}

/** hora en 12 horas con sufijo, por ejemplo 2:40 p. m. */
export function formatoHoraCompleta(fecha: Date): string {
  return `${formatoHora(fecha)} ${fecha.getHours() < 12 ? 'a. m.' : 'p. m.'}`;
}

/** duración en horas y minutos, por ejemplo 1 h 35 min */
export function formatoDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const MESES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

/** día y mes cortos, por ejemplo lun 2 nov */
export function formatoFechaCorta(fecha: Date): string {
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()]}`;
}
