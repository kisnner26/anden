import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Salida } from './salidas';

export const CLAVE_HABITUALES = 'anden.habituales';

/** la salida se considera "la de siempre" si parte a menos de esto de la hora guardada */
export const MINUTOS_DE_MARGEN = 45;

/** un viaje que la persona hace seguido: de dónde a dónde, qué días y a qué hora */
export interface Habitual {
  /** días de la semana, de 0 (domingo) a 6 (sábado) */
  dias: number[];
  destino: string;
  /** hora de salida, como HH:MM en 24 horas */
  hora: string;
  id: string;
  origen: string;
}

export function idHabitual(
  origen: string,
  destino: string,
  hora: string,
): string {
  return `hab_${origen}_${destino}_${hora}`.toLowerCase().replace(/\s+/g, '');
}

export function horaTexto(fecha: Date): string {
  const h = String(fecha.getHours()).padStart(2, '0');
  const m = String(fecha.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function minutosDelDia(hora: string): number {
  const [h = '0', m = '0'] = hora.split(':');
  return Number(h) * 60 + Number(m);
}

/** arma el viaje habitual a partir de una salida que la persona ya hizo o reservó */
export function habitualDeSalida(
  origen: string,
  destino: string,
  salida: Date,
): Habitual {
  const hora = horaTexto(salida);
  return {
    destino,
    dias: [salida.getDay()],
    hora,
    id: idHabitual(origen, destino, hora),
    origen,
  };
}

/** agrega el viaje; si ya estaba con otro día, suma el día en vez de repetirlo */
export function conHabitual(
  lista: readonly Habitual[],
  nuevo: Habitual,
): Habitual[] {
  const existente = lista.find((habitual) => habitual.id === nuevo.id);
  if (!existente) return [...lista, nuevo];
  const dias = [...new Set([...existente.dias, ...nuevo.dias])].sort();
  return lista.map((habitual) =>
    habitual.id === nuevo.id ? { ...habitual, dias } : habitual,
  );
}

export function sinHabitual(
  lista: readonly Habitual[],
  id: string | readonly string[],
): Habitual[] {
  const ids = typeof id === 'string' ? [id] : id;
  return lista.filter((habitual) => !ids.includes(habitual.id));
}

/** todos los viajes habituales de un mismo trayecto, aunque salgan a horas distintas */
export interface GrupoHabitual {
  destino: string;
  dias: number[];
  /** horas de salida HH:MM, de la más temprana a la más tarde */
  horas: string[];
  id: string;
  miembros: Habitual[];
  origen: string;
}

/** junta los viajes del mismo trayecto en uno solo para mostrarlos sin repetir */
export function agruparHabituales(lista: readonly Habitual[]): GrupoHabitual[] {
  const grupos = new Map<string, GrupoHabitual>();
  for (const habitual of lista) {
    const id = `${habitual.origen}>${habitual.destino}`.toLowerCase();
    const grupo = grupos.get(id) ?? {
      destino: habitual.destino,
      dias: [],
      horas: [],
      id,
      miembros: [],
      origen: habitual.origen,
    };
    grupo.miembros.push(habitual);
    grupo.dias = [...new Set([...grupo.dias, ...habitual.dias])].sort(
      (a, b) => a - b,
    );
    grupo.horas = [...new Set([...grupo.horas, habitual.hora])].sort();
    grupos.set(id, grupo);
  }
  return [...grupos.values()];
}

/** ¿esta salida es la que el viaje habitual espera? mismo trayecto, día de la semana y hora cercana */
export function esSalidaHabitual(habitual: Habitual, salida: Salida): boolean {
  if (
    salida.origen !== habitual.origen ||
    salida.destino !== habitual.destino
  ) {
    return false;
  }
  if (!habitual.dias.includes(salida.salida.getDay())) return false;
  const diferencia = Math.abs(
    minutosDelDia(horaTexto(salida.salida)) - minutosDelDia(habitual.hora),
  );
  return diferencia <= MINUTOS_DE_MARGEN;
}

/**
 * la próxima salida que le sirve a este viaje habitual: la primera que todavía no partió y que
 * coincide en trayecto, día y hora; nula si no hay ninguna en los días reservables
 */
export function proximaDelHabitual(
  habitual: Habitual,
  salidas: readonly Salida[],
  ahora: Date,
): Salida | null {
  const candidatas = salidas
    .filter(
      (salida) =>
        esSalidaHabitual(habitual, salida) &&
        salida.ventaAbierta &&
        salida.salida.getTime() >= ahora.getTime(),
    )
    .sort((a, b) => a.salida.getTime() - b.salida.getTime());
  return candidatas[0] ?? null;
}

/** la salida más cercana que le sirve a cualquiera de los viajes del trayecto */
export function proximaDelGrupo(
  grupo: GrupoHabitual,
  salidas: readonly Salida[],
  ahora: Date,
): Salida | null {
  const candidatas = grupo.miembros
    .map((habitual) => proximaDelHabitual(habitual, salidas, ahora))
    .filter((salida): salida is Salida => salida !== null)
    .sort((a, b) => a.salida.getTime() - b.salida.getTime());
  return candidatas[0] ?? null;
}

function esHabitual(valor: unknown): valor is Habitual {
  if (typeof valor !== 'object' || valor === null) return false;
  const h = valor as Record<string, unknown>;
  return (
    typeof h.id === 'string' &&
    typeof h.origen === 'string' &&
    typeof h.destino === 'string' &&
    typeof h.hora === 'string' &&
    Array.isArray(h.dias) &&
    h.dias.every((dia) => typeof dia === 'number')
  );
}

export async function leerHabituales(): Promise<Habitual[]> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_HABITUALES)) ?? '[]',
    );
    return Array.isArray(valor) ? valor.filter(esHabitual) : [];
  } catch {
    return [];
  }
}

export async function guardarHabituales(
  lista: readonly Habitual[],
): Promise<void> {
  await AsyncStorage.setItem(CLAVE_HABITUALES, JSON.stringify(lista));
}
