import type { DatosMuestra } from './muestra';

/** el viaje que se está compartiendo ahora entre dos ciudades, o null si ninguno */
export function viajeEnVivoEntre(
  datos: DatosMuestra,
  viajesEnVivo: readonly string[],
  ciudadOrigen: string,
  ciudadDestino: string,
): string | null {
  for (const viajeId of viajesEnVivo) {
    const viaje = datos.viajes.find((candidato) => candidato.id === viajeId);
    const ruta = datos.rutas.find(
      (candidata) => candidata.id === viaje?.rutaId,
    );
    if (!ruta) continue;
    const origen = datos.terminales.find((x) => x.id === ruta.origenId);
    const destino = datos.terminales.find((x) => x.id === ruta.destinoId);
    if (origen?.ciudad === ciudadOrigen && destino?.ciudad === ciudadDestino) {
      return viajeId;
    }
  }
  return null;
}
