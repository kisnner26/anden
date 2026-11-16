import { boletosVigentes } from './boletosVigentes';
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
  return `- ${dia} ${hora}, ${salida.origen} a ${salida.destino}, ${SERVICIO[salida.servicio] ?? salida.servicio}, punto de encuentro ${salida.puntoEncuentro || 'por confirmar'}, ${tarifa}, ${salida.asientosLibres} asientos libres, ${salida.estado}${atraso}${venta}`;
}

export function lineaDeBoleto({ boleto, resumen }: BoletoGuardado): string {
  const salida = new Date(resumen.salida);
  return `- ${formatoFechaCorta(salida)} ${formatoHoraCompleta(salida)}, a ${resumen.destino}, punto de encuentro ${resumen.puntoEncuentro || 'por confirmar'}, asiento ${boleto.asiento}, C$ ${boleto.precio}, ${boleto.estado}`;
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
  const vigentes = boletosVigentes(boletos).slice(0, MAXIMO_BOLETOS);

  return [
    `Ahora son las ${formatoHoraCompleta(ahora)} del ${formatoFechaCorta(ahora)}.`,
    'Próximas salidas:',
    proximas.length > 0 ? proximas.map(lineaDeSalida).join('\n') : '- ninguna',
    'Boletos vigentes de esta persona:',
    vigentes.length > 0 ? vigentes.map(lineaDeBoleto).join('\n') : '- ninguno',
  ].join('\n');
}

export interface OpcionesInstrucciones {
  /** la persona dijo que es turista: se le recomienda qué visitar, comer y hacer */
  turista?: boolean;
}

/**
 * las reglas que se le dan al modelo: horarios, precios, andenes y boletos salen solo de los datos;
 * sobre las ciudades y qué visitar puede contar lo que sabe, sin inventar nombres
 */
export function instruccionesDelAsistente(
  contexto: string,
  { turista = false }: OpcionesInstrucciones = {},
): string {
  return [
    'Sos el asistente de Andén, una app de buses interlocales entre Managua, Boaco y Juigalpa, en Nicaragua.',
    'Respondé siempre en español, en tono cercano y en pocas frases.',
    'Para horarios, tarifas, andenes, asientos y boletos usá solamente los datos de abajo. Si ese dato no está, decí que no lo sabés y sugerí mirar Horarios o Rutas en la app. No inventes horarios, precios ni andenes. Los precios están en córdobas (C$).',
    'Sobre las ciudades y el país (Managua, Boaco, Juigalpa, Nicaragua) sí podés contar lo que sabés: historia, datos curiosos, comida típica, lugares para visitar, clima y costumbres. Si no estás seguro de un nombre, un precio o un horario de un lugar, decilo en vez de inventarlo, y sugerí confirmar en el lugar.',
    'Cuando pregunte cuál salida le conviene, cuál elegir o cuál es la mejor, recomendale la salida marcada como "LA QUE MÁS CONVIENE" y decile en una frase por qué, con los motivos que trae esa marca; si no hay ninguna marcada, comparalas por hora, precio y asientos.',
    'Contestá solo lo que se preguntó: no repitas los datos ni los menciones si no tienen que ver con la pregunta, y nunca empieces con "Datos reales de Andén".',
    'Estilo: respondé primero lo que se preguntó en una frase directa y, si ayuda, sumá un solo dato útil. Sin relleno, sin repetir la pregunta y con voseo.',
    'No des consejos médicos, legales ni financieros.',
    turista
      ? 'La persona es turista: cuando pregunte por un destino, recomendale qué visitar, qué comer y qué hacer, con ideas concretas y cortas, y cómo llegar en bus desde Andén.'
      : '',
    '',
    contexto,
  ]
    .filter(
      (linea, indice, lineas) => linea !== '' || lineas[indice - 1] !== '',
    )
    .join('\n');
}
