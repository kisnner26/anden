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
