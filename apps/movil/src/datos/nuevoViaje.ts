import { leerPlus } from '@anden/dominio';

import { inicioDelDia } from '@/datos/dias';
import type { FilaViaje } from '@/servicios/supabase/viajesSupabase';

export interface BorradorViaje {
  puntoEncuentro: string;
  /** el día elegido; la hora se arma con `hora` */
  dia: Date;
  /** la hora escrita, por ejemplo 2:30; con `meridiano` es de 12 horas y sin él se lee como 24 horas */
  hora: string;
  /** a. m. o p. m.; la hora de 12 horas depende de esto */
  meridiano?: 'am' | 'pm';
  placa: string;
  rutaId: string | null;
  servicio: 'expreso' | 'ordinario';
}

export type ErrorViaje =
  'hora' | 'ocupada' | 'pasado' | 'placa' | 'punto' | 'ruta';

/** un viaje ya publicado de una unidad, para no ponerla en dos salidas a la vez */
export interface ViajeDeUnidad {
  placa: string;
  salida: Date;
}

/** cuánto antes o después de otro viaje la misma unidad no puede salir, en minutos */
export const MINUTOS_ENTRE_VIAJES = 60;

function clavePlaca(placa: string): string {
  return placa.replace(/[\s-]/g, '').toUpperCase();
}

const HORA = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const PLACA = /^[A-Za-z]{0,2}\s?\d{2,4}[-\s]?\d{0,4}$/;

/**
 * la hora escrita como 14:30, 10, 930 o 1430; con a. m. o p. m. se lee de 12 horas (12 a. m. es medianoche y 12 p. m.
 * mediodía). Nulo si no tiene formato
 */
export function leerHora(
  texto: string,
  meridiano?: 'am' | 'pm',
): { horas: number; minutos: number } | null {
  const limpio = texto.trim();
  // también se entiende escrita corta: 10, 930 o 1430
  const corta = /^(\d{1,2})$/.exec(limpio) ?? /^(\d{1,2})(\d{2})$/.exec(limpio);
  const coincide =
    HORA.exec(limpio) ?? (corta ? [limpio, corta[1], corta[2] ?? '00'] : null);
  if (!coincide) return null;
  let horas = Number(coincide[1]);
  const minutos = Number(coincide[2]);
  if (minutos > 59) return null;
  if (meridiano) {
    if (horas < 1 || horas > 12) return null;
    horas = (horas % 12) + (meridiano === 'pm' ? 12 : 0);
  }
  return horas <= 23 ? { horas, minutos } : null;
}

/** la fecha y hora de la salida con el día elegido y la hora escrita; nulo si la hora no es válida */
export function fechaDeSalida(borrador: BorradorViaje): Date | null {
  const hora = leerHora(borrador.hora, borrador.meridiano);
  if (!hora) return null;
  const fecha = new Date(borrador.dia);
  fecha.setHours(hora.horas, hora.minutos, 0, 0);
  return fecha;
}

/** lo que falta o está mal en el viaje; vacío si ya se puede publicar */
export function validarViaje(
  borrador: BorradorViaje,
  ahora: Date,
  existentes: readonly ViajeDeUnidad[] = [],
): ErrorViaje[] {
  const errores: ErrorViaje[] = [];
  if (borrador.rutaId === null) errores.push('ruta');
  if (!PLACA.test(borrador.placa.trim()) || borrador.placa.trim().length < 4) {
    errores.push('placa');
  }
  // el punto de encuentro es un Plus Code, completo o corto, como lo muestra Google Maps
  if (leerPlus(borrador.puntoEncuentro) === null) errores.push('punto');
  const fecha = fechaDeSalida(borrador);
  if (fecha === null) errores.push('hora');
  // una hora que ya pasó hoy se acepta: el bus ya espera en andén y se publica con su hora real
  else if (fecha.getTime() < inicioDelDia(ahora).getTime())
    errores.push('pasado');
  // una unidad no puede estar en dos salidas a la vez
  if (fecha && !errores.includes('placa')) {
    const placa = clavePlaca(borrador.placa);
    const choca = existentes.some(
      (otro) =>
        clavePlaca(otro.placa) === placa &&
        Math.abs(otro.salida.getTime() - fecha.getTime()) <
          MINUTOS_ENTRE_VIAJES * 60_000,
    );
    if (choca) errores.push('ocupada');
  }
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
  const punto = leerPlus(borrador.puntoEncuentro);
  if (fecha === null || borrador.rutaId === null || punto === null) return null;
  return {
    punto_encuentro: punto,
    chofer_id: choferId,
    estado: 'programado',
    id: idDeViaje(ahora, azar),
    placa: borrador.placa.trim().toUpperCase(),
    ruta_id: borrador.rutaId,
    salida: fecha.toISOString(),
    servicio: borrador.servicio,
  };
}
