import { digitosTelefonoNi } from '@anden/dominio';

import { TAMANOS, type TamanoEncomienda } from './encomiendas';
import type { CiudadRed, SentidoRed } from './redRutas';

/** lo que el modelo rellena a partir de lo que la persona cuenta de su paquete */
export interface SugerenciaEncomienda {
  /** la ciudad de la red a la que va o de la que viene (la otra punta es siempre Managua) */
  ciudad?: CiudadRed;
  descripcion: string;
  /** nombre de quien recibe, solo si la persona lo dijo */
  destinatario?: string;
  fragil: boolean;
  sentido?: SentidoRed;
  tamano: TamanoEncomienda;
  /** los 8 dígitos de quien recibe, si aparecieron en el texto */
  telefono?: string;
}

const CIUDADES: readonly CiudadRed[] = ['Boaco', 'Juigalpa'];

function sinTildes(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * lo que se puede leer sin modelo: un teléfono de Nicaragua, la ciudad y el sentido, y el nombre si viene
 * después de "para" con mayúscula. Es lo que se completa de inmediato mientras la persona escribe
 */
export function datosDelTexto(
  texto: string,
): Pick<
  SugerenciaEncomienda,
  'ciudad' | 'destinatario' | 'sentido' | 'telefono'
> {
  const resultado: ReturnType<typeof datosDelTexto> = {};
  const numero = /(?:\+?505[\s-]?)?[2578]\d{3}[\s-]?\d{4}/.exec(texto);
  const telefono = numero ? digitosTelefonoNi(numero[0]) : null;
  if (telefono) resultado.telefono = telefono;
  const plano = sinTildes(texto);
  for (const ciudad of CIUDADES) {
    const c = sinTildes(ciudad);
    if (!plano.includes(c)) continue;
    resultado.ciudad = ciudad;
    resultado.sentido = new RegExp(`\\b(desde|de|saliendo de)\\s+${c}\\b`).test(
      plano,
    )
      ? 'vuelta'
      : 'ida';
    break;
  }
  const nombre =
    /\bpara\s+(?:mi\s+)?([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/.exec(
      texto,
    );
  if (
    nombre?.[1] &&
    !CIUDADES.some((c) => c === nombre[1]) &&
    nombre[1] !== 'Managua'
  ) {
    resultado.destinatario = nombre[1];
  }
  return resultado;
}

/** las reglas que se le dan al modelo; sirven igual para Apple Intelligence y para Gemini, que solo reciben texto */
export function instruccionesDeEncomienda(): string {
  return [
    'Sos el asistente de envíos de Andén, una app de buses interlocales en Nicaragua.',
    'La persona cuenta qué quiere enviar en un bus. Tu trabajo es clasificarlo.',
    'Respondé SOLO con un JSON en una línea, sin texto antes ni después, con esta forma exacta:',
    '{"tamano":"sobre|pequeno|grande","fragil":true|false,"descripcion":"texto corto","destinatario":"nombre o vacío","ciudad":"Boaco|Juigalpa|vacío","sentido":"ida|vuelta|vacío"}',
    'tamano: "sobre" para documentos, cartas y cosas planas; "pequeno" si cabe en una mochila o una caja de zapatos; "grande" para cajas grandes, sacos, electrodomésticos o muebles.',
    'fragil: true si es de vidrio, cerámica, electrónico, líquido en botella, huevos o algo que se rompe con un golpe; si no estás seguro, false.',
    'descripcion: qué se envía, en menos de 60 caracteres, sin nombres ni teléfonos. No inventes detalles que la persona no dijo.',
    'destinatario: el nombre de quien recibe SOLO si la persona lo escribió; si no, texto vacío. ciudad: la ciudad (distinta de Managua) del envío si la nombró, si no vacío. sentido: "ida" si va desde Managua a esa ciudad, "vuelta" si viene de esa ciudad a Managua, si no vacío. No inventes ninguno de los tres.',
  ].join('\n');
}

const SOBRE =
  /\b(documentos?|cartas?|sobres?|papeles|papel|certificados?|títulos?|titulos?|pasaportes?|cédulas?|cedulas?|contratos?|planos?|recetas?)\b/i;
const GRANDE =
  /\b(saco|sacos|colchón|colchon|silla|sillas|mesa|mueble|muebles|refrigerador|refri|cocina|lavadora|bicicleta|bici|llantas?|caja grande|cajas grandes|televisor|tele|tv|pantalla|electrodomésticos?|electrodomesticos?)\b/i;
const FRAGIL =
  /\b(vidrio|cristal|frágil|fragil|cerámica|ceramica|espejo|espejos|huevos?|botellas?|vasos?|platos?|copas?|laptop|computadora|compu|televisor|tele|tv|pantalla|celular|teléfono|telefono|florero|jarrón|jarron|lámpara|lampara)\b/i;

/** una clasificación por palabras: no entiende tanto como el modelo, pero sirve si éste no responde bien */
export function sugerenciaPorPalabras(texto: string): SugerenciaEncomienda {
  const limpio = texto.trim();
  const tamano: TamanoEncomienda = GRANDE.test(limpio)
    ? 'grande'
    : SOBRE.test(limpio)
      ? 'sobre'
      : 'pequeno';
  return {
    ...datosDelTexto(limpio),
    descripcion: limpio.slice(0, 60),
    fragil: FRAGIL.test(limpio),
    tamano,
  };
}

/**
 * lee la respuesta del modelo. Acepta el JSON suelto o rodeado de texto; lo que no sea válido se
 * descarta, y si no sirve nada se cae en la clasificación por palabras
 */
export function leerSugerenciaEncomienda(
  respuesta: string,
  original: string,
): SugerenciaEncomienda {
  const respaldo = sugerenciaPorPalabras(original);
  const coincidencia = /\{[\s\S]*?\}/.exec(respuesta);
  if (!coincidencia) return respaldo;
  let crudo: unknown;
  try {
    crudo = JSON.parse(coincidencia[0]);
  } catch {
    return respaldo;
  }
  if (typeof crudo !== 'object' || crudo === null) return respaldo;
  const dato = crudo as Record<string, unknown>;
  const tamano = TAMANOS.find((opcion) => opcion === dato.tamano);
  const fragil =
    dato.fragil === true ||
    (typeof dato.fragil === 'string' && /^(true|sí|si)$/i.test(dato.fragil));
  const descripcion =
    typeof dato.descripcion === 'string' && dato.descripcion.trim().length >= 3
      ? dato.descripcion.trim().slice(0, 80)
      : respaldo.descripcion;
  const ciudad = CIUDADES.find((c) => c === dato.ciudad) ?? respaldo.ciudad;
  const sentido =
    dato.sentido === 'ida' || dato.sentido === 'vuelta'
      ? dato.sentido
      : respaldo.sentido;
  const nombre =
    typeof dato.destinatario === 'string' &&
    dato.destinatario.trim().length >= 2
      ? dato.destinatario.trim().slice(0, 60)
      : respaldo.destinatario;
  return {
    ...(ciudad ? { ciudad } : {}),
    descripcion,
    ...(nombre ? { destinatario: nombre } : {}),
    fragil: dato.fragil === undefined ? respaldo.fragil : fragil,
    ...(sentido ? { sentido } : {}),
    tamano: tamano ?? respaldo.tamano,
    // el teléfono nunca lo pone el modelo: solo cuenta el que está escrito en el texto
    ...(respaldo.telefono ? { telefono: respaldo.telefono } : {}),
  };
}
