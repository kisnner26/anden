import { distanciaKm, type Punto } from './busSimulado';

/** más lejos que esto del trazo, la unidad se considera fuera de la ruta */
export const KM_FUERA_DE_RUTA = 1.5;

export interface ProgresoViaje {
  /** distancia desde la posición hasta el punto más cercano del trazo */
  desvioKm: number;
  fueraDeRuta: boolean;
  /** 0 en el origen y 1 en el destino */
  fraccion: number;
  kmRecorridos: number;
  kmRestantes: number;
  minutosRestantes: number;
  porcentaje: number;
}

/** proyecta un punto sobre un segmento y devuelve la fracción (0 a 1) del segmento donde cae */
function fraccionEnSegmento(p: Punto, a: Punto, b: Punto): number {
  const kmLat = 111.32;
  const kmLng = kmLat * Math.cos((a.lat * Math.PI) / 180);
  const dx = (b.lng - a.lng) * kmLng;
  const dy = (b.lat - a.lat) * kmLat;
  const largo2 = dx * dx + dy * dy;
  if (largo2 === 0) return 0;
  const px = (p.lng - a.lng) * kmLng;
  const py = (p.lat - a.lat) * kmLat;
  return Math.min(1, Math.max(0, (px * dx + py * dy) / largo2));
}

/**
 * cuánto lleva recorrido un viaje: se busca el punto del trazo más cercano a la posición y de ahí
 * salen los kilómetros, el porcentaje y los minutos que faltan según la duración del viaje
 */
export function progresoSobreTrazo(
  trazo: readonly Punto[],
  posicion: Punto,
  duracionMin: number,
): ProgresoViaje | null {
  if (trazo.length < 2) return null;

  const tramos = trazo
    .slice(1)
    .map((punto, i) => distanciaKm(trazo[i]!, punto));
  const total = tramos.reduce((suma, largo) => suma + largo, 0);
  if (total === 0) return null;

  let mejorDesvio = Infinity;
  let mejorRecorrido = 0;
  let acumulado = 0;
  for (let i = 0; i < tramos.length; i += 1) {
    const a = trazo[i]!;
    const b = trazo[i + 1]!;
    const f = fraccionEnSegmento(posicion, a, b);
    const cercano: Punto = {
      lat: a.lat + (b.lat - a.lat) * f,
      lng: a.lng + (b.lng - a.lng) * f,
    };
    const desvio = distanciaKm(posicion, cercano);
    if (desvio < mejorDesvio) {
      mejorDesvio = desvio;
      mejorRecorrido = acumulado + f * tramos[i]!;
    }
    acumulado += tramos[i]!;
  }

  const fraccion = Math.min(1, Math.max(0, mejorRecorrido / total));
  return {
    desvioKm: Math.round(mejorDesvio * 10) / 10,
    fraccion,
    fueraDeRuta: mejorDesvio > KM_FUERA_DE_RUTA,
    kmRecorridos: Math.round(mejorRecorrido * 10) / 10,
    kmRestantes: Math.round((total - mejorRecorrido) * 10) / 10,
    minutosRestantes: Math.max(0, Math.round((1 - fraccion) * duracionMin)),
    porcentaje: Math.round(fraccion * 100),
  };
}
