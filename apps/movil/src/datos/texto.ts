/** el texto en minúsculas y sin tildes, para comparar lo que escribe la persona con los nombres de la app */
export function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
