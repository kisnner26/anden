import type { FilaViaje } from '@/servicios/supabase/viajesSupabase';

export interface BorradorViaje {
  anden: string;
  /** el día elegido; la hora se arma con `hora` */
  dia: Date;
  /** hora en 24 h, por ejemplo 14:30 */
  hora: string;
  placa: string;
  rutaId: string | null;
  servicio: 'expreso' | 'ordinario';
}

export type ErrorViaje = 'anden' | 'hora' | 'pasado' | 'placa' | 'ruta';

const HORA = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const PLACA = /^[A-Za-z]{0,2}\s?\d{2,4}[-\s]?\d{0,4}$/;

/** la hora escrita como 14:30; nulo si no tiene ese formato */
export function leerHora(
  texto: string,
): { horas: number; minutos: number } | null {
  const coincide = HORA.exec(texto.trim());
  if (!coincide) return null;
  return { horas: Number(coincide[1]), minutos: Number(coincide[2]) };
}

/** la fecha y hora de la salida con el día elegido y la hora escrita; nulo si la hora no es válida */
export function fechaDeSalida(borrador: BorradorViaje): Date | null {
  const hora = leerHora(borrador.hora);
  if (!hora) return null;
  const fecha = new Date(borrador.dia);
  fecha.setHours(hora.horas, hora.minutos, 0, 0);
  return fecha;
}

/** lo que falta o está mal en el viaje; vacío si ya se puede publicar */
export function validarViaje(
  borrador: BorradorViaje,
  ahora: Date,
): ErrorViaje[] {
  const errores: ErrorViaje[] = [];
  if (borrador.rutaId === null) errores.push('ruta');
  if (!PLACA.test(borrador.placa.trim()) || borrador.placa.trim().length < 4) {
    errores.push('placa');
  }
  const anden = Number(borrador.anden);
  if (!Number.isInteger(anden) || anden < 1 || anden > 99)
    errores.push('anden');
  const fecha = fechaDeSalida(borrador);
  if (fecha === null) errores.push('hora');
  else if (fecha.getTime() <= ahora.getTime()) errores.push('pasado');
  return errores;
}

/** un identificador único para el viaje nuevo */
export function idDeViaje(
  ahora: Date,
  azar: () => number = Math.random,
): string {
  return `via_${ahora.getTime().toString(36)}${Math.floor(azar() * 36 ** 3)
    .toString(36)
    .padStart(3, '0')}`;
}

/** la fila que se publica; solo se llama con un borrador ya validado */
export function armarFilaViaje(
  borrador: BorradorViaje,
  choferId: string,
  ahora: Date,
  azar: () => number = Math.random,
): FilaViaje | null {
  const fecha = fechaDeSalida(borrador);
  if (fecha === null || borrador.rutaId === null) return null;
  return {
    anden: Number(borrador.anden),
    chofer_id: choferId,
    estado: 'programado',
    id: idDeViaje(ahora, azar),
    placa: borrador.placa.trim().toUpperCase(),
    ruta_id: borrador.rutaId,
    salida: fecha.toISOString(),
    servicio: borrador.servicio,
  };
}
