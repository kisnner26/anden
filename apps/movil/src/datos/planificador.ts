import type { Salida } from './salidas';

const PENDIENTES = ['abordando', 'atrasado', 'programado'];

function horaReal(salida: Salida): number {
  return salida.salida.getTime() + salida.minutosAtraso * 60_000;
}

/** las salidas que todavía no parten hacia un destino, de la más próxima a la más lejana */
export function salidasPendientesHacia(
  salidas: readonly Salida[],
  destino: string,
): Salida[] {
  return salidas
    .filter(
      (salida) =>
        salida.destino === destino && PENDIENTES.includes(salida.estado),
    )
    .sort((a, b) => horaReal(a) - horaReal(b));
}

/** a qué hora se estima que llega un bus: la salida real más la duración estimada del trayecto; nunca es una promesa */
export function llegadaEstimada(salida: Salida, duracionMin: number): Date {
  return new Date(horaReal(salida) + duracionMin * 60_000);
}
