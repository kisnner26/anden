import type { Salida } from './salidas';

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** las salidas cuyo destino aparece en el texto, las más próximas primero; sirve para mostrar tarjetas junto a la respuesta */
export function salidasRelacionadas(
  texto: string,
  salidas: readonly Salida[],
  ahora: Date,
  maximo = 3,
): Salida[] {
  const buscado = sinTildes(texto);
  return salidas
    .filter(
      (salida) =>
        salida.salida.getTime() >= ahora.getTime() &&
        buscado.includes(sinTildes(salida.destino)),
    )
    .sort((a, b) => a.salida.getTime() - b.salida.getTime())
    .slice(0, maximo);
}

/** los destinos con más salidas por venir, para sugerir preguntas que sí tienen respuesta */
export function destinosFrecuentes(
  salidas: readonly Salida[],
  ahora: Date,
  maximo = 3,
): string[] {
  const cuenta = new Map<string, number>();
  for (const salida of salidas) {
    if (salida.salida.getTime() < ahora.getTime()) continue;
    cuenta.set(salida.destino, (cuenta.get(salida.destino) ?? 0) + 1);
  }
  return [...cuenta.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))
    .slice(0, maximo)
    .map(([destino]) => destino);
}

/** la salida más barata que todavía no parte, entre las que tienen tarifa y asientos */
export function salidaMasBarata(
  salidas: readonly Salida[],
  ahora: Date,
): Salida | null {
  const candidatas = salidas.filter(
    (salida) =>
      salida.tarifa !== null &&
      salida.asientosLibres > 0 &&
      salida.salida.getTime() >= ahora.getTime(),
  );
  candidatas.sort(
    (a, b) =>
      (a.tarifa ?? 0) - (b.tarifa ?? 0) ||
      a.salida.getTime() - b.salida.getTime(),
  );
  return candidatas[0] ?? null;
}

export interface ConsejoIA {
  /** el texto corto que se muestra */
  texto: string;
  /** la salida a la que lleva, si el consejo habla de una */
  viajeId: string | null;
}

/**
 * un consejo corto para la pantalla de inicio, armado con datos reales: el boleto que se acerca o
 * la próxima salida al destino habitual; nulo si no hay nada útil que decir
 */
export function consejoDelMomento(
  salidas: readonly Salida[],
  boletoProximo: {
    anden: number;
    destino: string;
    salida: Date;
    viajeId: string;
  } | null,
  destinoHabitual: string | null,
  ahora: Date,
): ConsejoIA | null {
  if (boletoProximo) {
    const minutos = Math.round(
      (boletoProximo.salida.getTime() - ahora.getTime()) / 60_000,
    );
    if (minutos >= 0 && minutos <= 120) {
      return {
        texto:
          minutos <= 1
            ? `Tu bus a ${boletoProximo.destino} sale ya, andén ${boletoProximo.anden}.`
            : `Tu bus a ${boletoProximo.destino} sale en ${minutos} min, andén ${boletoProximo.anden}.`,
        viajeId: boletoProximo.viajeId,
      };
    }
  }
  if (destinoHabitual) {
    const siguiente = salidas
      .filter(
        (salida) =>
          salida.destino === destinoHabitual &&
          salida.salida.getTime() >= ahora.getTime() &&
          salida.asientosLibres > 0,
      )
      .sort((a, b) => a.salida.getTime() - b.salida.getTime())[0];
    if (siguiente) {
      return {
        texto: `Tu próximo bus habitual a ${destinoHabitual} sale a las ${siguiente.salida.getHours() % 12 || 12}:${String(siguiente.salida.getMinutes()).padStart(2, '0')} ${siguiente.salida.getHours() >= 12 ? 'p. m.' : 'a. m.'}, quedan ${siguiente.asientosLibres} asientos.`,
        viajeId: siguiente.viajeId,
      };
    }
  }
  return null;
}
