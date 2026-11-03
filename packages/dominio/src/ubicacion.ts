import type { Coordenadas, Terminal } from './tipos';

const RADIO_TIERRA_KM = 6371;

function radianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

/** distancia geodésica entre dos puntos, en kilómetros. */
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const deltaLatitud = radianes(b.lat - a.lat);
  const deltaLongitud = radianes(b.lng - a.lng);
  const senoLatitud = Math.sin(deltaLatitud / 2);
  const senoLongitud = Math.sin(deltaLongitud / 2);
  const h =
    senoLatitud ** 2 +
    Math.cos(radianes(a.lat)) * Math.cos(radianes(b.lat)) * senoLongitud ** 2;
  return RADIO_TIERRA_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export interface TerminalCercana {
  distanciaKm: number;
  terminal: Terminal;
}

/** terminal más cercana a un punto; nulo cuando no hay terminales disponibles. */
export function terminalMasCercana(
  terminales: Terminal[],
  punto: Coordenadas,
): TerminalCercana | null {
  let cercana: TerminalCercana | null = null;
  for (const terminal of terminales) {
    const distancia = distanciaKm(terminal.coordenadas, punto);
    if (!cercana || distancia < cercana.distanciaKm) {
      cercana = { distanciaKm: distancia, terminal };
    }
  }
  return cercana;
}
