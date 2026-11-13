/** convierte un color #RRGGBB en rgba() con la opacidad dada, de 0 a 1 */
export function conAlfa(color: string, alfa: number): string {
  const rojo = parseInt(color.slice(1, 3), 16);
  const verde = parseInt(color.slice(3, 5), 16);
  const azul = parseInt(color.slice(5, 7), 16);
  return `rgba(${rojo}, ${verde}, ${azul}, ${alfa})`;
}

/** mezcla dos colores #RRGGBB; con `peso` 0 da el primero y con 1 el segundo. El resultado es opaco */
export function mezclar(
  primero: string,
  segundo: string,
  peso: number,
): string {
  const canal = (color: string, desde: number) =>
    parseInt(color.slice(desde, desde + 2), 16);
  const hex = (desde: number) => {
    const valor = Math.round(
      canal(primero, desde) * (1 - peso) + canal(segundo, desde) * peso,
    );
    return Math.min(255, Math.max(0, valor)).toString(16).padStart(2, '0');
  };
  return `#${hex(1)}${hex(3)}${hex(5)}`;
}
