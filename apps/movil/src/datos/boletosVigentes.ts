import type { BoletoGuardado } from './reserva';

/** los boletos vigentes, el que sale primero adelante; no cambia la lista que recibe */
export function boletosVigentes(
  boletos: readonly BoletoGuardado[],
): BoletoGuardado[] {
  return boletos
    .filter(({ boleto }) => boleto.estado === 'vigente')
    .sort(
      (a, b) =>
        new Date(a.resumen.salida).getTime() -
        new Date(b.resumen.salida).getTime(),
    );
}
