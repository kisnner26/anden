import AsyncStorage from '@react-native-async-storage/async-storage';

import { VARIANTES_BUS, type IdVarianteBus } from '@/componentes/Autobus';
import {
  esVehiculoPlus,
  type IdVehiculoPlus,
} from '@/componentes/VehiculoPlus';

/** lo que la persona eligió para que la representen: un bus de otro color o un vehículo de Plus */
export type EleccionUnidad = IdVarianteBus | IdVehiculoPlus;

export const CLAVE_BUS_PROPIO = 'anden.bus-propio';

/** cada cuenta guarda su propia elección */
export function claveBusPropioDe(cuenta: string | null): string {
  return cuenta ? `${CLAVE_BUS_PROPIO}.${cuenta}` : CLAVE_BUS_PROPIO;
}

function esVariante(valor: unknown): valor is EleccionUnidad {
  return (
    VARIANTES_BUS.some((variante) => variante.id === valor) ||
    esVehiculoPlus(valor)
  );
}

/** el bus que la persona eligió; nulo si no eligió ninguno o lo guardado ya no existe */
export async function leerBusPropio(
  cuenta: string | null = null,
): Promise<EleccionUnidad | null> {
  try {
    const guardado = await AsyncStorage.getItem(claveBusPropioDe(cuenta));
    return esVariante(guardado) ? guardado : null;
  } catch {
    return null;
  }
}

export async function guardarBusPropio(
  variante: EleccionUnidad | null,
  cuenta: string | null = null,
): Promise<void> {
  const clave = claveBusPropioDe(cuenta);
  if (variante === null) await AsyncStorage.removeItem(clave);
  else await AsyncStorage.setItem(clave, variante);
}
