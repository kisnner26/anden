import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export const CLAVE_INICIO_AUTOMATICO = 'anden.inicioAutomatico';

/** cuánto pasa desde que se abre la portada hasta que arranca sola: lo justo para ver llegar el bus, que en este modo corre rápido */
export const ESPERA_INICIO_AUTOMATICO_MS = 1150;

export async function leerInicioAutomatico(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_INICIO_AUTOMATICO)) === '1';
  } catch {
    return false;
  }
}

export async function guardarInicioAutomatico(activo: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_INICIO_AUTOMATICO, activo ? '1' : '0');
}

/** si la app arranca sola, sin deslizar en la portada; `activo` es nulo mientras se lee lo guardado */
export function useInicioAutomatico(): {
  activo: boolean | null;
  cambiar: (activo: boolean) => Promise<void>;
} {
  const [activo, establecerActivo] = useState<boolean | null>(null);

  useEffect(() => {
    let vigente = true;
    void leerInicioAutomatico().then((valor) => {
      if (vigente) establecerActivo(valor);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const cambiar = useCallback(async (valor: boolean) => {
    establecerActivo(valor);
    await guardarInicioAutomatico(valor);
  }, []);

  return { activo, cambiar };
}
