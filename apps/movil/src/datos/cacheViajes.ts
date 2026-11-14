import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ViajesPublicados } from '@/servicios/supabase/viajesSupabase';

export const CLAVE_CACHE_VIAJES = 'anden.cacheViajes';

export interface CacheViajes {
  guardadoEn: string;
  publicados: ViajesPublicados;
}

function esViajesPublicados(valor: unknown): valor is ViajesPublicados {
  if (typeof valor !== 'object' || valor === null) return false;
  const v = valor as Record<string, unknown>;
  return (
    Array.isArray(v.viajes) &&
    Array.isArray(v.choferes) &&
    Array.isArray(v.ocupacion) &&
    Array.isArray(v.historial)
  );
}

/** guarda lo último que respondió el servidor para poder mostrarlo sin internet */
export async function guardarCacheViajes(
  publicados: ViajesPublicados,
  ahora: Date = new Date(),
): Promise<void> {
  const cache: CacheViajes = { guardadoEn: ahora.toISOString(), publicados };
  try {
    await AsyncStorage.setItem(CLAVE_CACHE_VIAJES, JSON.stringify(cache));
  } catch {
    // sin espacio o sin almacenamiento la app sigue funcionando con lo que tiene en memoria
  }
}

/** lo último guardado, o nulo si no hay nada o está dañado */
export async function leerCacheViajes(): Promise<CacheViajes | null> {
  try {
    const crudo = await AsyncStorage.getItem(CLAVE_CACHE_VIAJES);
    if (crudo === null) return null;
    const valor: unknown = JSON.parse(crudo);
    if (typeof valor !== 'object' || valor === null) return null;
    const { guardadoEn, publicados } = valor as Record<string, unknown>;
    if (
      typeof guardadoEn !== 'string' ||
      Number.isNaN(Date.parse(guardadoEn))
    ) {
      return null;
    }
    return esViajesPublicados(publicados) ? { guardadoEn, publicados } : null;
  } catch {
    return null;
  }
}

/** "hace 5 min", "hace 2 h" o "hace 3 días", para decir qué tan viejos son los datos guardados */
export function antiguedadLegible(desde: Date, ahora: Date): string {
  const minutos = Math.max(
    0,
    Math.round((ahora.getTime() - desde.getTime()) / 60_000),
  );
  if (minutos < 1) return 'hace un momento';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
}
