import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Salida } from './salidas';

export const CLAVE_ESPERA = 'anden.espera';

/** una salida llena a la que la persona quiere subirse si se libera un asiento */
export interface Espera {
  creadaEn: string;
  destino: string;
  viajeId: string;
}

export function esperaDeSalida(
  salida: Salida,
  ahora: Date = new Date(),
): Espera {
  return {
    creadaEn: ahora.toISOString(),
    destino: salida.destino,
    viajeId: salida.viajeId,
  };
}

/** agrega la espera; pedir dos veces la misma salida no la repite */
export function conEspera(lista: readonly Espera[], nueva: Espera): Espera[] {
  return lista.some((espera) => espera.viajeId === nueva.viajeId)
    ? [...lista]
    : [...lista, nueva];
}

export function sinEspera(lista: readonly Espera[], viajeId: string): Espera[] {
  return lista.filter((espera) => espera.viajeId !== viajeId);
}

/** las salidas que estaban llenas y ahora tienen asientos y se pueden reservar */
export function salidasLiberadas(
  esperas: readonly Espera[],
  salidas: readonly Salida[],
): Salida[] {
  return esperas.flatMap((espera) => {
    const salida = salidas.find(
      (candidata) => candidata.viajeId === espera.viajeId,
    );
    return salida && salida.asientosLibres > 0 && salida.ventaAbierta
      ? [salida]
      : [];
  });
}

function esEspera(valor: unknown): valor is Espera {
  if (typeof valor !== 'object' || valor === null) return false;
  const e = valor as Record<string, unknown>;
  return (
    typeof e.viajeId === 'string' &&
    typeof e.destino === 'string' &&
    typeof e.creadaEn === 'string'
  );
}

export async function leerEsperas(): Promise<Espera[]> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_ESPERA)) ?? '[]',
    );
    return Array.isArray(valor) ? valor.filter(esEspera) : [];
  } catch {
    return [];
  }
}

export async function guardarEsperas(lista: readonly Espera[]): Promise<void> {
  await AsyncStorage.setItem(CLAVE_ESPERA, JSON.stringify(lista));
}
