/** lo que el panel sabe de la red: las tres terminales y cómo se llama cada ruta */
export type Terminal = 'boaco' | 'juigalpa' | 'managua';

export const TERMINALES: Record<
  Terminal,
  { lat: number; lng: number; nombre: string }
> = {
  boaco: { lat: 12.4693, lng: -85.6597, nombre: 'Boaco' },
  juigalpa: { lat: 12.1062, lng: -85.3636, nombre: 'Juigalpa' },
  managua: { lat: 12.1364, lng: -86.2514, nombre: 'Managua' },
};

const CODIGOS: Record<string, Terminal> = {
  boa: 'boaco',
  jui: 'juigalpa',
  may: 'managua',
};

/** de «rut_may_boa» saca origen y destino; nulo si el identificador no tiene esa forma */
export function extremosDeRuta(
  rutaId: string,
): { destino: Terminal; origen: Terminal } | null {
  const partes = rutaId.split('_');
  const origen = CODIGOS[partes[1] ?? ''];
  const destino = CODIGOS[partes[2] ?? ''];
  return origen && destino ? { destino, origen } : null;
}

/** «Managua → Boaco» a partir del identificador de la ruta */
export function nombreRuta(rutaId: string): string {
  const extremos = extremosDeRuta(rutaId);
  return extremos
    ? `${TERMINALES[extremos.origen].nombre} → ${TERMINALES[extremos.destino].nombre}`
    : rutaId;
}

/** los asientos de cada servicio: coaster de 26 para el ordinario y bus de 45 para el expreso */
export function capacidadDe(servicio: string): number {
  return servicio === 'expreso' ? 45 : 26;
}

/** el corredor al que pertenece una ruta: siempre sale o llega a Managua */
export function corredorDe(rutaId: string): 'boaco' | 'juigalpa' | null {
  const extremos = extremosDeRuta(rutaId);
  if (!extremos) return null;
  const otro =
    extremos.origen === 'managua' ? extremos.destino : extremos.origen;
  return otro === 'boaco' || otro === 'juigalpa' ? otro : null;
}

/** qué fracción del camino de Managua a la ciudad lleva un punto, de 0 a 1 */
export function fraccionEnCorredor(
  lat: number,
  lng: number,
  ciudad: 'boaco' | 'juigalpa',
): number {
  const a = TERMINALES.managua;
  const b = TERMINALES[ciudad];
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const t = ((lng - a.lng) * dx + (lat - a.lat) * dy) / (dx * dx + dy * dy);
  return Math.max(0, Math.min(1, t));
}

/** los puntos del dibujo de la red (lienzo de 900 por 360) */
export const PUNTOS_DIBUJO: Record<Terminal, { x: number; y: number }> = {
  boaco: { x: 720, y: 74 },
  juigalpa: { x: 748, y: 290 },
  managua: { x: 150, y: 182 },
};

/** dónde dibujar algo que va por el corredor, con su avance de 0 a 1 */
export function puntoEnDibujo(ciudad: 'boaco' | 'juigalpa', fraccion: number) {
  const a = PUNTOS_DIBUJO.managua;
  const b = PUNTOS_DIBUJO[ciudad];
  return { x: a.x + (b.x - a.x) * fraccion, y: a.y + (b.y - a.y) * fraccion };
}

/** el texto «26/26» o «12/45» de cuánto se llenó un viaje */
export function ocupacion(
  vendidos: number,
  servicio: string,
): { capacidad: number; fraccion: number; texto: string } {
  const capacidad = capacidadDe(servicio);
  return {
    capacidad,
    fraccion: Math.min(1, vendidos / capacidad),
    texto: `${vendidos}/${capacidad}`,
  };
}
