/** convierte un color #RRGGBB en rgba() con la opacidad dada, de 0 a 1 */
export function conAlfa(color: string, alfa: number): string {
  const rojo = parseInt(color.slice(1, 3), 16);
  const verde = parseInt(color.slice(3, 5), 16);
  const azul = parseInt(color.slice(5, 7), 16);
  return `rgba(${rojo}, ${verde}, ${azul}, ${alfa})`;
}
