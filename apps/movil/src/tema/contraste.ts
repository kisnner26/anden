function canal(valor: number): number {
  const proporcion = valor / 255;
  return proporcion <= 0.03928
    ? proporcion / 12.92
    : ((proporcion + 0.055) / 1.055) ** 2.4;
}

/** luminancia relativa de un color #RRGGBB según WCAG */
export function luminancia(color: string): number {
  const rojo = parseInt(color.slice(1, 3), 16);
  const verde = parseInt(color.slice(3, 5), 16);
  const azul = parseInt(color.slice(5, 7), 16);
  return 0.2126 * canal(rojo) + 0.7152 * canal(verde) + 0.0722 * canal(azul);
}

/** razón de contraste WCAG entre dos colores #RRGGBB, de 1 a 21 */
export function contraste(primero: string, segundo: string): number {
  const [claro, oscuro] = [luminancia(primero), luminancia(segundo)].sort(
    (a, b) => b - a,
  ) as [number, number];
  return (claro + 0.05) / (oscuro + 0.05);
}
