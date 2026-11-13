import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizar } from './buscarSalidas';

export const CLAVE_RECIENTES = 'anden.busquedas';
export const MAXIMO_RECIENTES = 5;

/** pone la búsqueda al principio, sin repetirla y sin pasar del máximo (cinco, o más con Plus) */
export function agregarReciente(
  recientes: readonly string[],
  texto: string,
  maximo: number = MAXIMO_RECIENTES,
): string[] {
  const limpio = texto.trim();
  if (limpio.length < 2) return [...recientes];
  const otros = recientes.filter(
    (reciente) => normalizar(reciente) !== normalizar(limpio),
  );
  return [limpio, ...otros].slice(0, maximo);
}

export async function leerRecientes(): Promise<string[]> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_RECIENTES)) ?? '[]',
    );
    return Array.isArray(valor)
      ? valor.filter((v): v is string => typeof v === 'string')
      : [];
  } catch {
    return [];
  }
}

export async function guardarReciente(
  texto: string,
  maximo: number = MAXIMO_RECIENTES,
): Promise<string[]> {
  const nuevos = agregarReciente(await leerRecientes(), texto, maximo);
  await AsyncStorage.setItem(CLAVE_RECIENTES, JSON.stringify(nuevos));
  return nuevos;
}

export async function borrarRecientes(): Promise<void> {
  await AsyncStorage.removeItem(CLAVE_RECIENTES);
}
