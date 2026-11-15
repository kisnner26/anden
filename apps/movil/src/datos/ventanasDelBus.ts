/** cuántas de las ventanas de la silueta se encienden según qué tan lleno va el bus: siempre una si ya hay alguien y todas si está lleno */
export function ventanasEncendidas(proporcion: number, total = 8): number {
  const p = Math.min(1, Math.max(0, proporcion));
  if (p === 0) return 0;
  return Math.min(total, Math.max(1, Math.round(p * total)));
}
