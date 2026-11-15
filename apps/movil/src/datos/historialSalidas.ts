import type { SalidaRegistrada } from './estimacionSalida';

let historial: SalidaRegistrada[] = [];

/** lo aprendido de los viajes que ya salieron, para estimar los próximos */
export function fijarHistorial(salidas: SalidaRegistrada[]): void {
  historial = salidas;
}

export function obtenerHistorial(): readonly SalidaRegistrada[] {
  return historial;
}

let cancelados = new Set<string>();

/** los viajes que el conductor canceló, para avisarle a quien tenía boleto */
export function fijarCancelados(ids: readonly string[]): void {
  cancelados = new Set(ids);
}

export function viajeCancelado(viajeId: string): boolean {
  return cancelados.has(viajeId);
}

let motivos: Readonly<Record<string, string>> = {};

/** por qué canceló el conductor cada viaje, cuando lo dijo */
export function fijarMotivos(porViaje: Readonly<Record<string, string>>): void {
  motivos = porViaje;
}

export function motivoDeCancelacion(viajeId: string): string | null {
  return motivos[viajeId] ?? null;
}

export interface BusquedaDePasajeros {
  hasta: Date;
  mensaje: string | null;
}

let busquedas: Readonly<Record<string, BusquedaDePasajeros>> = {};

/** los viajes cuyo chofer está buscando pasajeros, con hasta cuándo y su frase */
export function fijarBusquedas(
  porViaje: Readonly<Record<string, BusquedaDePasajeros>>,
): void {
  busquedas = porViaje;
}

/** la búsqueda de pasajeros de un viaje si sigue vigente; nula si no la hay o ya venció */
export function busquedaDe(
  viajeId: string,
  ahora: Date,
): BusquedaDePasajeros | null {
  const busqueda = busquedas[viajeId];
  return busqueda && busqueda.hasta.getTime() > ahora.getTime()
    ? busqueda
    : null;
}
