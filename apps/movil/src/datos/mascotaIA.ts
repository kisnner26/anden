import { limpiarTexto } from './consultaIA';
import { t } from '@/textos/t';

/** lo máximo que cabe cómodo en el globo de la mascota */
export const MAXIMO_RESPUESTA = 170;

/**
 * las reglas con las que habla Rumbo: breve, con voseo, sin inventar nada que no esté en los datos que se le pasan
 * y sin hablar de cosas ajenas a viajar en bus
 */
export function instruccionesDeRumbo(datos: string): string {
  return [
    'Sos Rumbo, un microbús simpático que acompaña a la persona dentro de la app Andén, de buses interlocales de Nicaragua.',
    'Respondé en español con voseo, en una o dos frases cortas, tono cálido y con un poquito de humor, sin emojis.',
    'Usá solo los datos de abajo. Si no los tenés, decilo sin inventar horarios, precios ni lugares.',
    'Nunca muestres identificadores internos. Si te piden algo que no tiene que ver con viajar, redirigí con amabilidad.',
    '',
    'Datos reales de la app:',
    datos,
  ].join('\n');
}

/** deja la respuesta lista para el globo: sin identificadores, en una línea corta y terminada en punto */
export function limpiarRespuestaDeRumbo(texto: string): string {
  const limpio = limpiarTexto(texto)
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/[*_#`]/g, '')
    .trim();
  if (limpio.length <= MAXIMO_RESPUESTA) return limpio;
  const corte = limpio.slice(0, MAXIMO_RESPUESTA);
  const finDeFrase = Math.max(
    corte.lastIndexOf('. '),
    corte.lastIndexOf('! '),
    corte.lastIndexOf('? '),
  );
  return finDeFrase > 60
    ? corte.slice(0, finDeFrase + 1)
    : `${corte.replace(/[\s,;:]+\S*$/, '')}…`;
}

const FRASES = [
  'mascota.frase1',
  'mascota.frase2',
  'mascota.frase3',
  'mascota.frase4',
  'mascota.frase5',
] as const;

/** una frase suelta para cuando se la toca y la IA no está disponible; rota para no repetirse */
export function fraseDeRespaldo(vez: number): string {
  return t(FRASES[Math.abs(vez) % FRASES.length]!);
}
