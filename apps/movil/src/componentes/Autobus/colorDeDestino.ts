import { paletaAutobus, paletasAutobus } from '@/tema/colores';

import { buscarVariante, varianteDeClave } from './variantes';

/** el color de la banda del bus de un destino: sirve para reconocerlo de un vistazo en calendarios y marcas */
export function colorDeDestino(destino: string): string {
  const { paleta } = buscarVariante(varianteDeClave(destino));
  return { ...paletaAutobus, ...paletasAutobus[paleta] }.banda;
}
