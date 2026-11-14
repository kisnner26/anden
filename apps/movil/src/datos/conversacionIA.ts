import { limpiarTexto } from './consultaIA';
import { FICHAS, fichaDeCiudad, textoDeFicha } from './fichasCiudad';
import { formatoFechaCorta, formatoHoraCompleta } from './formato';
import type { Salida } from './salidas';

/** las fichas de ciudad que se mandan al módulo nativo para que la herramienta fichaDeCiudad las consulte */
export function fichasParaElModelo(): Record<string, string> {
  return Object.fromEntries(
    FICHAS.map((ficha) => [ficha.ciudad, textoDeFicha(ficha)]),
  );
}

export interface OpcionesConversacion {
  turista?: boolean;
}

/**
 * las reglas fijas de la conversación. Los datos reales llegan en cada mensaje, ya buscados por la app, y
 * las herramientas quedan para lo que falte; el modelo no debe suponer nada que no esté ahí
 */
export function instruccionesDeConversacion({
  turista = false,
}: OpcionesConversacion = {}): string {
  return [
    'Sos el asistente de Andén, una app de buses interlocales entre Managua, Boaco y Juigalpa, en Nicaragua. Estás dentro de la app: conocés a la persona, sus boletos y las salidas reales.',
    'Respondé en español, tono cercano, de una a cuatro frases. Sin emojis. Si sabés el nombre de la persona, usalo con naturalidad.',
    'Cada mensaje trae "Datos reales de Andén": usalos tal cual y respondé con ellos. Si la lista tiene salidas, mencionalas con su día, hora y tarifa; nunca digas que no hay viajes cuando la lista trae alguno. Si los datos no alcanzan, consultá las herramientas antes de decir que no sabés.',
    'Cuando pregunten cuánto vale un boleto, respondé con la tarifa en córdobas (C$) del trayecto. Nunca inventes horarios, precios ni puntos de encuentro.',
    'Nunca escribas identificadores internos ni números entre corchetes en el texto: los números [n] de las salidas solo van en el campo salidas, para mostrarlas como tarjetas.',
    'Para recomendar qué visitar usá la herramienta fichaDeCiudad y no agregues lugares que no estén en la ficha.',
    'En el campo ciudad poné la ciudad de la que habla la respuesta, y en seguimientos preguntas cortas que tengan sentido para esta persona.',
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

/** un id real a partir de lo que el modelo puso: el número [n] de la lista o, por costumbre, el id mismo */
function resolverReferencia(
  valor: unknown,
  referencias: readonly string[],
): string | null {
  if (typeof valor === 'number' && Number.isInteger(valor)) {
    return referencias[valor - 1] ?? null;
  }
  if (typeof valor !== 'string') return null;
  const limpio = valor.trim();
  const numero = /^\[?\s*(\d+)\s*\]?$/.exec(limpio);
  if (numero?.[1]) return referencias[Number(numero[1]) - 1] ?? null;
  return limpio;
}

/**
 * lee el JSON (a medias o completo) del modelo. Solo deja salidas que existen de verdad y ciudades con
 * ficha, y borra del texto cualquier identificador que se le haya escapado; una alucinación nunca llega
 * a la pantalla como una tarjeta. `referencias` son los ids de las salidas en el orden en que se numeraron.
 */
export function leerRespuestaRica(
  json: string,
  salidas: readonly Salida[],
  referencias: readonly string[] = [],
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
  const ids = Array.isArray(crudo.salidas)
    ? crudo.salidas
        .map((valor) => resolverReferencia(valor, referencias))
        .filter((id): id is string => id !== null)
    : [];
  const reales = [...new Set(ids)]
    .map((id) => porId.get(id))
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
      .map((texto) => limpiarTexto(texto))
      .filter((texto) => texto.length > 1)
      .slice(0, 3),
    texto: typeof crudo.texto === 'string' ? limpiarTexto(crudo.texto) : '',
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
