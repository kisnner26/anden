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
