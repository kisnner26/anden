export interface Punto {
  lat: number;
  lng: number;
}

export interface RegionMapa {
  latitude: number;
  latitudeDelta: number;
  longitude: number;
  longitudeDelta: number;
}

/** el punto a la fracción indicada del tramo entre dos coordenadas (0 es el origen, 1 el destino) */
export function interpolar(
  origen: Punto,
  destino: Punto,
  fraccion: number,
): Punto {
  const f = Math.min(1, Math.max(0, fraccion));
  return {
    lat: origen.lat + (destino.lat - origen.lat) * f,
    lng: origen.lng + (destino.lng - origen.lng) * f,
  };
}

/**
 * progreso de un bus simulado: da vueltas sin parar a lo largo del recorrido, así que siempre
 * hay uno en camino. No representa a ninguna unidad real.
 */
export function progresoSimulado(ahora: Date, duracionMin: number): number {
  const ciclo = duracionMin * 60_000;
  if (ciclo <= 0) return 0;
  return (ahora.getTime() % ciclo) / ciclo;
}

export function minutosRestantes(
  progreso: number,
  duracionMin: number,
): number {
  return Math.max(0, Math.ceil((1 - progreso) * duracionMin));
}

/** región que deja ver los dos extremos con un margen del 40 % */
export function regionQueEncierra(a: Punto, b: Punto): RegionMapa {
  const margen = 1.4;
  return {
    latitude: (a.lat + b.lat) / 2,
    latitudeDelta: Math.max(0.02, Math.abs(a.lat - b.lat) * margen),
    longitude: (a.lng + b.lng) / 2,
    longitudeDelta: Math.max(0.02, Math.abs(a.lng - b.lng) * margen),
  };
}
