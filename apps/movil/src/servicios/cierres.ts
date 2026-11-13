import AsyncStorage from '@react-native-async-storage/async-storage';

import { estadoDePago, resumenDeCobro, type RegistroPagos } from './pagos';

export const CLAVE_CIERRES = 'anden.cierres';

export interface PasajeroCierre {
  asiento: number;
  boletoId: string;
  nombre: string;
  precio: number;
}

/** el resumen que el conductor deja al terminar un viaje: quién pagó, cuánto cobró y quién no pagó */
export interface CierreViaje {
  cerradoEn: string;
  choferId: string;
  cobrado: number;
  pagados: number;
  pasajeros: number;
  pendiente: number;
  sinPagar: PasajeroCierre[];
  total: number;
  viajeId: string;
}

export function armarCierre(
  pasajeros: readonly PasajeroCierre[],
  pagos: RegistroPagos,
  viajeId: string,
  choferId: string,
  ahora: Date = new Date(),
): CierreViaje {
  const cobro = resumenDeCobro(
    pasajeros.map((pasajero) => ({
      id: pasajero.boletoId,
      precio: pasajero.precio,
    })),
    pagos,
  );
  return {
    ...cobro,
    cerradoEn: ahora.toISOString(),
    choferId,
    pasajeros: pasajeros.length,
    sinPagar: pasajeros
      .filter(
        (pasajero) => estadoDePago(pagos, pasajero.boletoId) === 'pendiente',
      )
      .sort((a, b) => a.asiento - b.asiento),
    viajeId,
  };
}

export function esCierre(valor: unknown): valor is CierreViaje {
  if (typeof valor !== 'object' || valor === null) return false;
  const c = valor as Record<string, unknown>;
  return (
    typeof c.viajeId === 'string' &&
    typeof c.choferId === 'string' &&
    typeof c.cerradoEn === 'string' &&
    typeof c.cobrado === 'number' &&
    typeof c.pendiente === 'number' &&
    typeof c.total === 'number' &&
    typeof c.pagados === 'number' &&
    typeof c.pasajeros === 'number' &&
    Array.isArray(c.sinPagar)
  );
}

export async function leerCierres(): Promise<CierreViaje[]> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_CIERRES)) ?? '[]',
    );
    return Array.isArray(valor) ? valor.filter(esCierre) : [];
  } catch {
    return [];
  }
}

/** guarda el cierre; cerrar dos veces el mismo viaje deja solo el último */
export async function guardarCierre(
  cierre: CierreViaje,
): Promise<CierreViaje[]> {
  const existentes = await leerCierres();
  const lista = [
    ...existentes.filter((c) => c.viajeId !== cierre.viajeId),
    cierre,
  ];
  await AsyncStorage.setItem(CLAVE_CIERRES, JSON.stringify(lista));
  return lista;
}

/**
 * lo que necesita la app para guardar y leer los cierres de viaje; hoy lo cumple `crearCierresLocal` y
 * con Supabase `crearCierresSupabase`, con las mismas pruebas de contrato
 */
export interface ServicioCierres {
  guardar(cierre: CierreViaje): Promise<CierreViaje[]>;
  leer(): Promise<CierreViaje[]>;
}

export function crearCierresLocal(): ServicioCierres {
  return { guardar: guardarCierre, leer: leerCierres };
}
