import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export const CLAVE_MODO_SIMPLE = 'anden.modoSimple';

const oyentes = new Set<(activo: boolean) => void>();

export async function leerModoSimple(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_MODO_SIMPLE)) === '1';
  } catch {
    return false;
  }
}

export async function guardarModoSimple(activo: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_MODO_SIMPLE, activo ? '1' : '0');
  for (const oyente of oyentes) oyente(activo);
}

/**
 * el modo simple: un inicio con botones muy grandes para quien no usa bien el teléfono. Lo comparten Ajustes, donde un
 * familiar lo enciende, y el inicio, que cambia al instante; `activo` es nulo mientras se lee lo guardado
 */
export function useModoSimple(): {
  activo: boolean | null;
  cambiar: (activo: boolean) => Promise<void>;
} {
  const [activo, establecerActivo] = useState<boolean | null>(null);

  useEffect(() => {
    let vigente = true;
    void leerModoSimple().then((valor) => {
      if (vigente) establecerActivo(valor);
    });
    oyentes.add(establecerActivo);
    return () => {
      vigente = false;
      oyentes.delete(establecerActivo);
    };
  }, []);

  const cambiar = useCallback(async (valor: boolean) => {
    await guardarModoSimple(valor);
  }, []);

  return { activo, cambiar };
}
