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

/** distancia aproximada entre dos puntos en kilómetros, suficiente para repartir un trazo */
export function distanciaKm(a: Punto, b: Punto): number {
  const kmPorGrado = 111.32;
  const dy = (b.lat - a.lat) * kmPorGrado;
  const dx =
    (b.lng - a.lng) *
    kmPorGrado *
    Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
  return Math.hypot(dx, dy);
}

/** el punto a la fracción indicada del largo de un trazo (0 es el inicio, 1 el final) */
export function puntoSobreTrazo(
  trazo: readonly Punto[],
  fraccion: number,
): Punto {
  const primero = trazo[0];
  const ultimo = trazo[trazo.length - 1];
  if (!primero || !ultimo) throw new Error('el trazo no tiene puntos');
  const f = Math.min(1, Math.max(0, fraccion));
  if (f === 0) return primero;
  if (f === 1) return ultimo;

  const tramos = trazo
    .slice(1)
    .map((punto, i) => distanciaKm(trazo[i]!, punto));
  const total = tramos.reduce((suma, largo) => suma + largo, 0);
  let recorrido = f * total;
  for (let i = 0; i < tramos.length; i += 1) {
    const largo = tramos[i]!;
    if (recorrido <= largo) {
      return interpolar(
        trazo[i]!,
        trazo[i + 1]!,
        largo === 0 ? 0 : recorrido / largo,
      );
    }
    recorrido -= largo;
  }
  return ultimo;
}

/** región que deja ver todo el trazo con un margen del 20 % */
export function regionQueEncierraTrazo(trazo: readonly Punto[]): RegionMapa {
  const lats = trazo.map((p) => p.lat);
  const lngs = trazo.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const margen = 1.2;
  return {
    latitude: (minLat + maxLat) / 2,
    latitudeDelta: Math.max(0.02, (maxLat - minLat) * margen),
    longitude: (minLng + maxLng) / 2,
    longitudeDelta: Math.max(0.02, (maxLng - minLng) * margen),
  };
}
