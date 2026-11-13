/** los vehículos exclusivos de Andén Plus: la persona elige uno y los demás lo ven junto a su nombre */
export const VEHICULOS_PLUS = [
  { id: 'avion', nombre: 'Avión' },
  { id: 'nave', nombre: 'Nave espacial' },
  { id: 'tractor', nombre: 'Tractor' },
  { id: 'tren', nombre: 'Tren' },
  { id: 'helicoptero', nombre: 'Helicóptero' },
  { id: 'submarino', nombre: 'Submarino' },
] as const;

export type IdVehiculoPlus = (typeof VEHICULOS_PLUS)[number]['id'];

export function esVehiculoPlus(valor: unknown): valor is IdVehiculoPlus {
  return VEHICULOS_PLUS.some((vehiculo) => vehiculo.id === valor);
}

export function nombreDeVehiculo(id: IdVehiculoPlus): string {
  return VEHICULOS_PLUS.find((vehiculo) => vehiculo.id === id)?.nombre ?? id;
}
