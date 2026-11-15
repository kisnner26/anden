export interface Coordenada {
  lat: number;
  lng: number;
}

const RADIO_TIERRA_M = 6_371_000;
const aRadianes = (grados: number) => (grados * Math.PI) / 180;

/** la distancia en metros entre dos puntos, sobre la superficie de la Tierra */
export function distanciaM(a: Coordenada, b: Coordenada): number {
  const dLat = aRadianes(b.lat - a.lat);
  const dLng = aRadianes(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.lat)) *
      Math.cos(aRadianes(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** hacia dónde hay que mirar para ir de `a` a `b`: grados desde el norte, en el sentido del reloj, de 0 a 360 */
export function rumboGrados(a: Coordenada, b: Coordenada): number {
  const dLng = aRadianes(b.lng - a.lng);
  const lat1 = aRadianes(a.lat);
  const lat2 = aRadianes(b.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((((Math.atan2(y, x) * 180) / Math.PI) % 360) + 360) % 360;
}

/** la diferencia más corta entre dos rumbos, de -180 a 180: positiva si `destino` queda a la derecha de `origen` */
export function diferenciaDeRumbo(origen: number, destino: number): number {
  return ((((destino - origen) % 360) + 540) % 360) - 180;
}
