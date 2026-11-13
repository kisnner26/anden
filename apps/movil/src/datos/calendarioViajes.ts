import type { BoletoGuardado } from './reserva';

export interface MesCalendario {
  anio: number;
  /** 0 es enero */
  mes: number;
}

/** las semanas de un mes con el lunes primero; los huecos antes del 1 y después del último día son nulos */
export function semanasDelMes({
  anio,
  mes,
}: MesCalendario): (number | null)[][] {
  const primero = new Date(anio, mes, 1);
  const ultimo = new Date(anio, mes + 1, 0).getDate();
  // getDay: domingo 0; para empezar en lunes el domingo pasa a 6
  const hueco = (primero.getDay() + 6) % 7;
  const celdas: (number | null)[] = [
    ...Array.from({ length: hueco }, () => null),
    ...Array.from({ length: ultimo }, (_, i) => i + 1),
  ];
  while (celdas.length % 7 !== 0) celdas.push(null);
  const semanas: (number | null)[][] = [];
  for (let i = 0; i < celdas.length; i += 7)
    semanas.push(celdas.slice(i, i + 7));
  return semanas;
}

/** los boletos de cada día de un mes, del más tarde al más temprano dentro del día */
export function viajesPorDia(
  boletos: readonly BoletoGuardado[],
  { anio, mes }: MesCalendario,
): Map<number, BoletoGuardado[]> {
  const dias = new Map<number, BoletoGuardado[]>();
  for (const guardado of boletos) {
    const fecha = new Date(guardado.resumen.salida);
    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes) continue;
    const lista = dias.get(fecha.getDate()) ?? [];
    lista.push(guardado);
    dias.set(fecha.getDate(), lista);
  }
  for (const lista of dias.values()) {
    lista.sort(
      (a, b) =>
        new Date(b.resumen.salida).getTime() -
        new Date(a.resumen.salida).getTime(),
    );
  }
  return dias;
}

export function mesDe(fecha: Date): MesCalendario {
  return { anio: fecha.getFullYear(), mes: fecha.getMonth() };
}

export function mesSiguiente({ anio, mes }: MesCalendario): MesCalendario {
  return mes === 11 ? { anio: anio + 1, mes: 0 } : { anio, mes: mes + 1 };
}

export function mesAnterior({ anio, mes }: MesCalendario): MesCalendario {
  return mes === 0 ? { anio: anio - 1, mes: 11 } : { anio, mes: mes - 1 };
}

/** compara dos meses: negativo si a es anterior, cero si son el mismo */
export function compararMeses(a: MesCalendario, b: MesCalendario): number {
  return (a.anio - b.anio) * 12 + (a.mes - b.mes);
}

/** el primer y el último mes con viajes, para no dejar navegar al vacío; nulo sin viajes */
export function rangoDeMeses(
  boletos: readonly BoletoGuardado[],
): { desde: MesCalendario; hasta: MesCalendario } | null {
  if (boletos.length === 0) return null;
  const meses = boletos.map((b) => mesDe(new Date(b.resumen.salida)));
  const orden = [...meses].sort(compararMeses);
  return { desde: orden[0]!, hasta: orden[orden.length - 1]! };
}
