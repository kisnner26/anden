import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export const CLAVE_BOLETO_CLASICO = 'anden.boletoClasico';

/** si la persona eligió ver el boleto como el de papel de la cooperativa; por defecto no */
export async function leerBoletoClasico(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_BOLETO_CLASICO)) === '1';
  } catch {
    return false;
  }
}

const oyentes = new Set<(activo: boolean) => void>();

/** guarda la elección y avisa al instante a las pantallas que la están mostrando */
export async function guardarBoletoClasico(activo: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_BOLETO_CLASICO, activo ? '1' : '0');
  for (const oyente of oyentes) oyente(activo);
}

/**
 * el ajuste "Boleto clásico": se comparte entre Ajustes, donde se enciende, y la pantalla del boleto, que cambia al
 * instante; `activo` es nulo mientras se lee lo guardado
 */
export function useBoletoClasico(): {
  activo: boolean | null;
  cambiar: (activo: boolean) => Promise<void>;
} {
  const [activo, establecerActivo] = useState<boolean | null>(null);

  useEffect(() => {
    let vigente = true;
    void leerBoletoClasico().then((valor) => {
      if (vigente) establecerActivo(valor);
    });
    oyentes.add(establecerActivo);
    return () => {
      vigente = false;
      oyentes.delete(establecerActivo);
    };
  }, []);

  const cambiar = useCallback(async (valor: boolean) => {
    await guardarBoletoClasico(valor);
  }, []);

  return { activo, cambiar };
}
