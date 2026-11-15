import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export const CLAVE_ACTIVIDAD_EN_VIVO = 'anden.actividadEnVivo';

/** por defecto está encendida: solo se apaga si la persona lo pidió */
export async function leerActividadEnVivo(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_ACTIVIDAD_EN_VIVO)) !== '0';
  } catch {
    return true;
  }
}

export async function guardarActividadEnVivo(activa: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_ACTIVIDAD_EN_VIVO, activa ? '1' : '0');
}

/** si la actividad del viaje (isla dinámica y pantalla de bloqueo) está permitida; `activa` es nulo mientras se lee */
export function usePreferenciaActividad(): {
  activa: boolean | null;
  cambiar: (activa: boolean) => Promise<void>;
} {
  const [activa, establecerActiva] = useState<boolean | null>(null);

  useEffect(() => {
    let vigente = true;
    void leerActividadEnVivo().then((valor) => {
      if (vigente) establecerActiva(valor);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const cambiar = useCallback(async (valor: boolean) => {
    establecerActiva(valor);
    await guardarActividadEnVivo(valor);
  }, []);

  return { activa, cambiar };
}
