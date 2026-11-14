import { TAMANOS, type TamanoEncomienda } from './encomiendas';

/** lo que el modelo rellena a partir de lo que la persona cuenta de su paquete */
export interface SugerenciaEncomienda {
  descripcion: string;
  fragil: boolean;
  tamano: TamanoEncomienda;
}

/** las reglas que se le dan al modelo; sirven igual para Apple Intelligence y para Gemini, que solo reciben texto */
export function instruccionesDeEncomienda(): string {
  return [
    'Sos el asistente de envíos de Andén, una app de buses interlocales en Nicaragua.',
    'La persona cuenta qué quiere enviar en un bus. Tu trabajo es clasificarlo.',
    'Respondé SOLO con un JSON en una línea, sin texto antes ni después, con esta forma exacta:',
    '{"tamano":"sobre|pequeno|grande","fragil":true|false,"descripcion":"texto corto"}',
    'tamano: "sobre" para documentos, cartas y cosas planas; "pequeno" si cabe en una mochila o una caja de zapatos; "grande" para cajas grandes, sacos, electrodomésticos o muebles.',
    'fragil: true si es de vidrio, cerámica, electrónico, líquido en botella, huevos o algo que se rompe con un golpe; si no estás seguro, false.',
    'descripcion: qué se envía, en menos de 60 caracteres, sin nombres ni teléfonos. No inventes detalles que la persona no dijo.',
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
  return {
    descripcion,
    fragil: dato.fragil === undefined ? respaldo.fragil : fragil,
    tamano: tamano ?? respaldo.tamano,
  };
}
