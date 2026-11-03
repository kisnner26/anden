/** pone los valores en los huecos {nombre} de un texto; un hueco sin valor queda tal cual */
export function rellenar(
  texto: string,
  valores: Record<string, number | string>,
): string {
  return texto.replace(/\{(\w+)\}/g, (hueco, nombre: string) =>
    nombre in valores ? String(valores[nombre]) : hueco,
  );
}
