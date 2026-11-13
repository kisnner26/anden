import { formatoFechaCorta, formatoHoraCompleta } from './formato';
import type { BoletoGuardado } from './reserva';
import type { Salida } from './salidas';

/** el modelo del teléfono tiene poca memoria: se le da lo más cercano y nada más */
export const MAXIMO_SALIDAS = 14;
export const MAXIMO_BOLETOS = 4;

const SERVICIO: Record<string, string> = {
  expreso: 'expreso',
  ordinario: 'ordinario',
};

export function lineaDeSalida(salida: Salida): string {
  const hora = formatoHoraCompleta(salida.salida);
  const dia = formatoFechaCorta(salida.salida);
  const atraso =
    salida.minutosAtraso > 0 ? `, atrasada ${salida.minutosAtraso} min` : '';
  const tarifa =
    salida.tarifa === null ? 'tarifa no disponible' : `C$ ${salida.tarifa}`;
  const venta = salida.ventaAbierta ? '' : ', venta cerrada';
  return `- ${dia} ${hora}, ${salida.origen} a ${salida.destino}, ${SERVICIO[salida.servicio] ?? salida.servicio}, andén ${salida.anden}, ${tarifa}, ${salida.asientosLibres} asientos libres, ${salida.estado}${atraso}${venta}`;
}

export function lineaDeBoleto({ boleto, resumen }: BoletoGuardado): string {
  const salida = new Date(resumen.salida);
  return `- ${formatoFechaCorta(salida)} ${formatoHoraCompleta(salida)}, a ${resumen.destino}, andén ${resumen.anden}, asiento ${boleto.asiento}, C$ ${boleto.precio}, ${boleto.estado}`;
}

/**
 * el texto con los datos reales de la app que se le pasa al modelo: las próximas salidas y los boletos
 * vigentes de la persona; nada más
 */
export function armarContexto(
  salidas: readonly Salida[],
  boletos: readonly BoletoGuardado[],
  ahora: Date,
): string {
  const proximas = salidas
    .filter(
      (salida) => salida.salida.getTime() >= ahora.getTime() - 60 * 60_000,
    )
    .sort((a, b) => a.salida.getTime() - b.salida.getTime())
    .slice(0, MAXIMO_SALIDAS);
  const vigentes = boletos
    .filter(({ boleto }) => boleto.estado === 'vigente')
    .sort(
      (a, b) =>
        new Date(a.resumen.salida).getTime() -
        new Date(b.resumen.salida).getTime(),
    )
    .slice(0, MAXIMO_BOLETOS);

  return [
    `Ahora son las ${formatoHoraCompleta(ahora)} del ${formatoFechaCorta(ahora)}.`,
    'Próximas salidas:',
    proximas.length > 0 ? proximas.map(lineaDeSalida).join('\n') : '- ninguna',
    'Boletos vigentes de esta persona:',
    vigentes.length > 0 ? vigentes.map(lineaDeBoleto).join('\n') : '- ninguno',
  ].join('\n');
}

/** las reglas que se le dan al modelo: solo responde con lo que está en los datos */
export function instruccionesDelAsistente(contexto: string): string {
  return [
    'Sos el asistente de Andén, una app de buses interlocales entre Managua, Boaco y Juigalpa, en Nicaragua.',
    'Respondé siempre en español, en tono cercano y en pocas frases.',
    'Usá solamente los datos de abajo. Si la respuesta no está en los datos, decí que no lo sabés y sugerí mirar Horarios o Rutas en la app.',
    'No inventes horarios, precios ni andenes. Los precios están en córdobas (C$). No des consejos médicos, legales ni financieros.',
    '',
    contexto,
  ].join('\n');
}
