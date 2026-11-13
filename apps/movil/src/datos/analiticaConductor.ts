import type { CierreViaje } from '@/servicios/cierres';

export type PeriodoAnalitica = 7 | 30 | 90;

export interface DiaDeActividad {
  cobrado: number;
  /** el día en formato AAAA-MM-DD, en hora local */
  dia: string;
  pasajeros: number;
  viajes: number;
}

export interface ResumenAnalitica {
  /** lo cobrado dividido entre lo que se debía cobrar, de 0 a 1 */
  cobranza: number;
  cobrado: number;
  /** el día con más ganancias dentro del período; nulo si no hubo viajes */
  mejorDia: DiaDeActividad | null;
  pasajeros: number;
  /** ganancia media por viaje cerrado */
  porViaje: number;
  /** pasajeros medios por viaje cerrado */
  pasajerosPorViaje: number;
  pendiente: number;
  viajes: number;
}

function claveDelDia(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** los cierres cuyo día cae dentro de los últimos `dias` días, contando hoy */
export function cierresDelPeriodo(
  cierres: readonly CierreViaje[],
  dias: number,
  ahora: Date,
): CierreViaje[] {
  const desde = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate(),
  );
  desde.setDate(desde.getDate() - (dias - 1));
  return cierres.filter((cierre) => new Date(cierre.cerradoEn) >= desde);
}

/** un renglón por cada día del período, también los que no tuvieron viajes, del más viejo al de hoy */
export function actividadPorDia(
  cierres: readonly CierreViaje[],
  dias: number,
  ahora: Date,
): DiaDeActividad[] {
  const lista: DiaDeActividad[] = [];
  for (let atras = dias - 1; atras >= 0; atras -= 1) {
    const fecha = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
    );
    fecha.setDate(fecha.getDate() - atras);
    lista.push({
      cobrado: 0,
      dia: claveDelDia(fecha),
      pasajeros: 0,
      viajes: 0,
    });
  }
  const porDia = new Map(lista.map((dia) => [dia.dia, dia]));
  for (const cierre of cierres) {
    const dia = porDia.get(claveDelDia(new Date(cierre.cerradoEn)));
    if (!dia) continue;
    dia.cobrado += cierre.cobrado;
    dia.pasajeros += cierre.pasajeros;
    dia.viajes += 1;
  }
  return lista;
}

export function resumirActividad(
  cierres: readonly CierreViaje[],
  dias: number,
  ahora: Date,
): ResumenAnalitica {
  const delPeriodo = cierresDelPeriodo(cierres, dias, ahora);
  const cobrado = delPeriodo.reduce((suma, c) => suma + c.cobrado, 0);
  const pendiente = delPeriodo.reduce((suma, c) => suma + c.pendiente, 0);
  const pasajeros = delPeriodo.reduce((suma, c) => suma + c.pasajeros, 0);
  const viajes = delPeriodo.length;
  const porDia = actividadPorDia(delPeriodo, dias, ahora);
  const mejor = porDia.reduce<DiaDeActividad | null>(
    (mayor, dia) => (dia.cobrado > (mayor?.cobrado ?? 0) ? dia : mayor),
    null,
  );
  const esperado = cobrado + pendiente;
  return {
    cobranza: esperado === 0 ? 0 : cobrado / esperado,
    cobrado,
    mejorDia: mejor,
    pasajeros,
    pasajerosPorViaje: viajes === 0 ? 0 : pasajeros / viajes,
    pendiente,
    porViaje: viajes === 0 ? 0 : cobrado / viajes,
    viajes,
  };
}
