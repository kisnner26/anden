import type { Salida } from './salidas';

const PENDIENTES = ['abordando', 'atrasado', 'programado'];

/** una salida por destino: la próxima que todavía no parte, de la más cercana a la más lejana */
export function destinosDeHoy(salidas: readonly Salida[]): Salida[] {
  const hora = (salida: Salida) =>
    salida.salida.getTime() + salida.minutosAtraso * 60_000;
  const porDestino = new Map<string, Salida>();
  for (const salida of salidas) {
    if (!PENDIENTES.includes(salida.estado)) continue;
    const actual = porDestino.get(salida.destino);
    if (!actual || hora(salida) < hora(actual)) {
      porDestino.set(salida.destino, salida);
    }
  }
  return [...porDestino.values()].sort((a, b) => hora(a) - hora(b));
}
