import { textos } from './es';

type RutasDeTexto<T, Prefijo extends string = ''> = T extends string
  ? Prefijo
  : {
      [Clave in keyof T & string]: RutasDeTexto<
        T[Clave],
        `${Prefijo}${Prefijo extends '' ? '' : '.'}${Clave}`
      >;
    }[keyof T & string];

type ValorEnRuta<T, Ruta extends string> = Ruta extends `${infer Cabeza}.${infer Cola}`
  ? Cabeza extends keyof T
    ? ValorEnRuta<T[Cabeza], Cola>
    : never
  : Ruta extends keyof T
    ? T[Ruta]
    : never;

export type RutaTexto = RutasDeTexto<typeof textos>;

export function t<Ruta extends RutaTexto>(ruta: Ruta): ValorEnRuta<typeof textos, Ruta> {
  return ruta
    .split('.')
    .reduce<unknown>(
      (valor, segmento) => (valor as Record<string, unknown>)[segmento],
      textos,
    ) as ValorEnRuta<typeof textos, Ruta>;
}
