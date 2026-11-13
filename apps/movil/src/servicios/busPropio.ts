import AsyncStorage from '@react-native-async-storage/async-storage';

import { VARIANTES_BUS, type IdVarianteBus } from '@/componentes/Autobus';

export const CLAVE_BUS_PROPIO = 'anden.bus-propio';

function esVariante(valor: unknown): valor is IdVarianteBus {
  return VARIANTES_BUS.some((variante) => variante.id === valor);
}

/** el bus que la persona eligió; nulo si no eligió ninguno o lo guardado ya no existe */
export async function leerBusPropio(): Promise<IdVarianteBus | null> {
  try {
    const guardado = await AsyncStorage.getItem(CLAVE_BUS_PROPIO);
    return esVariante(guardado) ? guardado : null;
  } catch {
    return null;
  }
}

export async function guardarBusPropio(
  variante: IdVarianteBus | null,
): Promise<void> {
  if (variante === null) await AsyncStorage.removeItem(CLAVE_BUS_PROPIO);
  else await AsyncStorage.setItem(CLAVE_BUS_PROPIO, variante);
}
