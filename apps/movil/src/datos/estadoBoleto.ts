import type { BoletoGuardado } from './reserva';

export type EstadoVisibleBoleto = 'cancelado' | 'usado' | 'vencido' | 'vigente';

/** estado que se comunica en la app sin alterar el estado persistido del dominio */
export function estadoVisibleBoleto(
  guardado: BoletoGuardado,
  ahora: Date,
): EstadoVisibleBoleto {
  if (guardado.boleto.estado === 'cancelado') return 'cancelado';
  if (guardado.boleto.estado === 'usado') return 'usado';
  return new Date(guardado.resumen.salida) < ahora ? 'vencido' : 'vigente';
}

export function minutosHastaSalida(
  guardado: BoletoGuardado,
  ahora: Date,
): number {
  return Math.max(
    0,
    Math.ceil(
      (new Date(guardado.resumen.salida).getTime() - ahora.getTime()) / 60_000,
    ),
  );
}
