import { useCallback, useEffect, useState } from 'react';

import { supabase } from './supabase';

/** trae una lista del servidor y la renueva cada pocos segundos para que el panel siempre esté al día */
export function useLista<T>(
  tabla: string,
  columnas: string,
  orden?: { columna: string; ascendente?: boolean },
  cadaMs = 10_000,
): { cargando: boolean; filas: T[]; recargar: () => Promise<void> } {
  const [filas, establecerFilas] = useState<T[]>([]);
  const [cargando, establecerCargando] = useState(true);

  const recargar = useCallback(async () => {
    if (!supabase) return;
    let consulta = supabase.from(tabla).select(columnas);
    if (orden) {
      consulta = consulta.order(orden.columna, {
        ascending: orden.ascendente ?? false,
      });
    }
    const { data, error } = await consulta.limit(500);
    if (!error && data) establecerFilas(data as unknown as T[]);
    establecerCargando(false);
  }, [columnas, orden?.ascendente, orden?.columna, tabla]);

  useEffect(() => {
    void recargar();
    const temporizador = setInterval(() => void recargar(), cadaMs);
    return () => clearInterval(temporizador);
  }, [cadaMs, recargar]);

  return { cargando, filas, recargar };
}
