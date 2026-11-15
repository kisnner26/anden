import { limpiarTexto } from './consultaIA';

/** lo máximo que cabe cómodo en el globo de la mascota */
export const MAXIMO_RESPUESTA = 170;

/**
 * lo que se le pide a la IA del teléfono: una sola frase de ayuda, directa y concreta para la pantalla donde está la
 * persona, sin presentarse ni saludar ni hacer chistes, con ejemplos del tono y solo con datos reales
 */
export function instruccionesDeAyuda(entrada: {
  apuro: string;
  datos: string;
  pantalla: string;
}): string {
  return [
    'Escribís la ayuda breve de la app Andén, de buses interlocales de Nicaragua.',
    `La persona está en ${entrada.pantalla}. Le pasa esto: ${entrada.apuro}.`,
    'Escribí UNA sola frase de 12 a 24 palabras, en español con voseo, que le diga exactamente qué hacer ahora para salir del apuro en esa pantalla.',
    'Reglas: hablale directo ("probá", "revisá", "elegí"). No te presentes, no digas quién sos, no saludes, no digas "tranquilo", no hagas chistes, no uses emojis ni comillas, no repitas el problema y no hagas preguntas. No inventes horarios, precios ni lugares: usá solo los datos reales de abajo, y solo si hacen falta.',
    'Ejemplos del tono:',
    '- Revisá que tu usuario y tu contraseña estén bien escritos; con el ojito podés ver lo que escribís.',
    '- Ese asiento ya se ocupó, así que elegí otro de los libres y volvé a reservar.',
    '- Sin señal tus boletos guardados se ven igual; lo demás vuelve cuando haya internet.',
    '',
    'Datos reales de la app:',
    entrada.datos,
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
