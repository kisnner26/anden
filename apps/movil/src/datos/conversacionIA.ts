import { FICHAS, fichaDeCiudad, textoDeFicha } from './fichasCiudad';
import { formatoFechaCorta, formatoHoraCompleta } from './formato';
import type { BoletoGuardado } from './reserva';
import type { Salida } from './salidas';
import { lineaDeBoleto, lineaDeSalida } from './contextoIA';

/** el modelo del teléfono tiene poca memoria: se le da lo más cercano y nada más */
export const SALIDAS_PARA_EL_MODELO = 14;
export const BOLETOS_PARA_EL_MODELO = 4;

/** lo que se manda al módulo nativo para que las herramientas del modelo consulten datos reales */
export interface DatosParaElModelo {
  boletos: string[];
  fichas: Record<string, string>;
  salidas: {
    destino: string;
    id: string;
    libres: number;
    linea: string;
    origen: string;
    tarifa: number | null;
  }[];
}

export function armarDatosParaElModelo(
  salidas: readonly Salida[],
  boletos: readonly BoletoGuardado[],
  ahora: Date,
): DatosParaElModelo {
  const proximas = salidas
    .filter(
      (salida) => salida.salida.getTime() >= ahora.getTime() - 60 * 60_000,
    )
    .sort((a, b) => a.salida.getTime() - b.salida.getTime())
    .slice(0, SALIDAS_PARA_EL_MODELO);
  const vigentes = boletos
    .filter(({ boleto }) => boleto.estado === 'vigente')
    .sort(
      (a, b) =>
        new Date(a.resumen.salida).getTime() -
        new Date(b.resumen.salida).getTime(),
    )
    .slice(0, BOLETOS_PARA_EL_MODELO);
  return {
    boletos: vigentes.map(lineaDeBoleto),
    fichas: Object.fromEntries(
      FICHAS.map((ficha) => [ficha.ciudad, textoDeFicha(ficha)]),
    ),
    salidas: proximas.map((salida) => ({
      destino: salida.destino,
      id: salida.viajeId,
      libres: salida.asientosLibres,
      linea: `id=${salida.viajeId} ${lineaDeSalida(salida)}`,
      origen: salida.origen,
      tarifa: salida.tarifa,
    })),
  };
}

export interface OpcionesConversacion {
  turista?: boolean;
}

/** las reglas fijas de la conversación: los datos llegan por las herramientas, no en el texto */
export function instruccionesDeConversacion({
  turista = false,
}: OpcionesConversacion = {}): string {
  return [
    'Sos el asistente de Andén, una app de buses interlocales entre Managua, Boaco y Juigalpa, en Nicaragua.',
    'Respondé en español, tono cercano, de una a cuatro frases. Sin emojis.',
    'Horarios, tarifas, asientos, puntos de encuentro y boletos: consultá SIEMPRE las herramientas antes de responder y usá solo lo que devuelven. Si no devuelven el dato, decí que no lo sabés y sugerí mirar Horarios en la app. Nunca inventes horarios, precios ni puntos de encuentro. Los precios están en córdobas (C$).',
    'Para recomendar qué visitar usá la herramienta fichaDeCiudad y no agregues lugares que no estén en la ficha. Si preguntan algo de una ciudad que la ficha no cubre, decí que no tenés ese dato.',
    'En el campo salidas poné solo ids que devolvieron las herramientas. En el campo ciudad poné la ciudad de la que habla la respuesta.',
    'No des consejos médicos, legales ni financieros.',
    turista
      ? 'La persona es turista: recomendale qué visitar y cómo llegar en bus desde Andén, con ideas cortas.'
      : '',
  ]
    .filter((linea) => linea !== '')
    .join('\n');
}

/** lo que el modelo devolvió, ya validado contra los datos reales de la app */
export interface RespuestaRica {
  /** la ciudad con ficha de la que habla la respuesta */
  ciudad: string | null;
  mostrarBoletos: boolean;
  salidas: Salida[];
  seguimientos: string[];
  texto: string;
}

export const RESPUESTA_VACIA: RespuestaRica = {
  ciudad: null,
  mostrarBoletos: false,
  salidas: [],
  seguimientos: [],
  texto: '',
};

function textos(valor: unknown): string[] {
  return Array.isArray(valor)
    ? valor.filter((v): v is string => typeof v === 'string')
    : [];
}

/**
 * lee el JSON (a medias o completo) del modelo. Solo deja salidas que existen de verdad y ciudades con
 * ficha, así una alucinación nunca llega a la pantalla como una tarjeta.
 */
export function leerRespuestaRica(
  json: string,
  salidas: readonly Salida[],
): RespuestaRica {
  let crudo: Record<string, unknown>;
  try {
    const valor: unknown = JSON.parse(json);
    if (typeof valor !== 'object' || valor === null) return RESPUESTA_VACIA;
    crudo = valor as Record<string, unknown>;
  } catch {
    return RESPUESTA_VACIA;
  }
  const porId = new Map(salidas.map((salida) => [salida.viajeId, salida]));
  const reales = [...new Set(textos(crudo.salidas))]
    .map((id) => porId.get(id.trim()))
    .filter((salida): salida is Salida => salida !== undefined)
    .slice(0, 3);
  const ciudad =
    typeof crudo.ciudad === 'string'
      ? (fichaDeCiudad(crudo.ciudad)?.ciudad ?? null)
      : null;
  return {
    ciudad,
    mostrarBoletos: crudo.mostrarBoletos === true,
    salidas: reales,
    seguimientos: textos(crudo.seguimientos)
      .map((texto) => texto.trim())
      .filter((texto) => texto.length > 1)
      .slice(0, 3),
    texto: typeof crudo.texto === 'string' ? crudo.texto.trim() : '',
  };
}

/** el nombre legible de lo que consulta el modelo, para mostrar "Buscando salidas…" */
export function actividadDeHerramienta(herramienta: string): string {
  switch (herramienta) {
    case 'buscarSalidas':
      return 'Buscando salidas';
    case 'salidaMasBarata':
      return 'Comparando tarifas';
    case 'misBoletos':
      return 'Revisando tus boletos';
    case 'fichaDeCiudad':
      return 'Consultando la ciudad';
    default:
      return 'Pensando';
  }
}

/** una línea con la hora y el día, usada por las tarjetas */
export function cuandoSale(salida: Date): string {
  return `${formatoFechaCorta(salida)} · ${formatoHoraCompleta(salida)}`;
}
