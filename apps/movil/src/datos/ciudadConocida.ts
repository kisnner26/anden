/** la ciudad si está entre las conocidas; si no (o si no es un texto, como pasa con algunos enlaces), la de siempre */
export function ciudadConocida(
  valor: unknown,
  ciudades: readonly string[],
  porDefecto: string,
): string {
  return typeof valor === 'string' && ciudades.includes(valor)
    ? valor
    : porDefecto;
}
