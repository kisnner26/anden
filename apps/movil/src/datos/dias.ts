/** cuántos días hacia adelante se puede reservar, contando hoy */
export const DIAS_DE_RESERVA = 7;

const MS_DIA = 86_400_000;

/** la medianoche local del día de una fecha */
export function inicioDelDia(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

export function mismoDia(a: Date, b: Date): boolean {
  return inicioDelDia(a).getTime() === inicioDelDia(b).getTime();
}

/** el día que está `dias` después del día de `base` */
export function sumarDias(base: Date, dias: number): Date {
  const inicio = inicioDelDia(base);
  return new Date(
    inicio.getFullYear(),
    inicio.getMonth(),
    inicio.getDate() + dias,
  );
}

/** hoy y los días siguientes en los que se puede reservar */
export function diasDeReserva(
  ahora: Date,
  cantidad: number = DIAS_DE_RESERVA,
): Date[] {
  return Array.from({ length: cantidad }, (_, i) => sumarDias(ahora, i));
}

export type NombreDia = 'hoy' | 'manana' | 'otro';

/** hoy, mañana u otro día, para elegir el rótulo del selector */
export function nombreDelDia(dia: Date, ahora: Date): NombreDia {
  const diferencia = Math.round(
    (inicioDelDia(dia).getTime() - inicioDelDia(ahora).getTime()) / MS_DIA,
  );
  if (diferencia === 0) return 'hoy';
  if (diferencia === 1) return 'manana';
  return 'otro';
}
