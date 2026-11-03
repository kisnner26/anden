export const FRANJAS = ['madrugada', 'manana', 'tarde', 'noche'] as const;
export type Franja = (typeof FRANJAS)[number];

/** Managua es UTC-06:00 todo el año, sin horario de verano */
const DESFASE_MANAGUA_HORAS = 6;

/** la hora de reloj de Managua (0 a 23) de un instante */
export function horaEnManagua(instante: Date): number {
  return (instante.getUTCHours() - DESFASE_MANAGUA_HORAS + 24) % 24;
}

/** madrugada 00:00-05:59, mañana 06:00-11:59, tarde 12:00-17:59, noche 18:00-23:59, hora de Managua */
export function franjaHoraria(instante: Date): Franja {
  const hora = horaEnManagua(instante);
  if (hora < 6) return 'madrugada';
  if (hora < 12) return 'manana';
  if (hora < 18) return 'tarde';
  return 'noche';
}
