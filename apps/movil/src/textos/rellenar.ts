/** pone los valores en los huecos {nombre} o {{nombre}} de un texto; un hueco sin valor queda tal cual */
export function rellenar(
  texto: string,
  valores: Record<string, number | string>,
): string {
  return texto.replace(
    /\{\{(\w+)\}\}|\{(\w+)\}/g,
    (hueco, doble: string | undefined, simple: string | undefined) => {
      const nombre = doble ?? simple ?? '';
      return nombre in valores ? String(valores[nombre]) : hueco;
    },
  );
}
