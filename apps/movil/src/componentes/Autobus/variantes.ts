import type { NombrePaletaAutobus } from '@/tema/colores';

import type { NombreForma } from './formas';

export interface VarianteBus {
  forma: NombreForma;
  id: string;
  nombre: string;
  paleta: NombrePaletaAutobus;
}

/** las variantes del bus: cinco siluetas, cada una en varios colores */
export const VARIANTES_BUS = [
  {
    forma: 'estandar',
    id: 'clasico-ambar',
    nombre: 'Clásico ámbar',
    paleta: 'ambar',
  },
  {
    forma: 'estandar',
    id: 'clasico-azul',
    nombre: 'Clásico azul',
    paleta: 'azul',
  },
  {
    forma: 'estandar',
    id: 'clasico-verde',
    nombre: 'Clásico verde',
    paleta: 'verde',
  },
  {
    forma: 'estandar',
    id: 'clasico-rojo',
    nombre: 'Clásico rojo',
    paleta: 'rojo',
  },
  {
    forma: 'coaster',
    id: 'coaster-ambar',
    nombre: 'Coaster ámbar',
    paleta: 'ambar',
  },
  {
    forma: 'coaster',
    id: 'coaster-turquesa',
    nombre: 'Coaster turquesa',
    paleta: 'turquesa',
  },
  {
    forma: 'coaster',
    id: 'coaster-violeta',
    nombre: 'Coaster violeta',
    paleta: 'violeta',
  },
  {
    forma: 'expreso',
    id: 'expreso-grafito',
    nombre: 'Expreso grafito',
    paleta: 'grafito',
  },
  {
    forma: 'expreso',
    id: 'expreso-azul',
    nombre: 'Expreso azul',
    paleta: 'azul',
  },
  {
    forma: 'expreso',
    id: 'expreso-rojo',
    nombre: 'Expreso rojo',
    paleta: 'rojo',
  },
  {
    forma: 'expreso',
    id: 'expreso-verde',
    nombre: 'Expreso verde',
    paleta: 'verde',
  },
  {
    forma: 'micro',
    id: 'micro-naranja',
    nombre: 'Micro naranja',
    paleta: 'naranja',
  },
  {
    forma: 'micro',
    id: 'micro-blanco',
    nombre: 'Micro blanco',
    paleta: 'blanco',
  },
  { forma: 'micro', id: 'micro-azul', nombre: 'Micro azul', paleta: 'azul' },
  {
    forma: 'doble',
    id: 'doble-ambar',
    nombre: 'Dos pisos ámbar',
    paleta: 'ambar',
  },
  {
    forma: 'doble',
    id: 'doble-grafito',
    nombre: 'Dos pisos grafito',
    paleta: 'grafito',
  },
  {
    forma: 'doble',
    id: 'doble-verde',
    nombre: 'Dos pisos verde',
    paleta: 'verde',
  },
] as const satisfies readonly VarianteBus[];

export type IdVarianteBus = (typeof VARIANTES_BUS)[number]['id'];

export const VARIANTE_POR_DEFECTO: IdVarianteBus = 'clasico-ambar';

export function buscarVariante(id: IdVarianteBus): VarianteBus {
  return (
    VARIANTES_BUS.find((variante) => variante.id === id) ?? VARIANTES_BUS[0]
  );
}

/** un número estable a partir de un texto, para repartir variantes sin azar */
function resumen(texto: string): number {
  let valor = 7;
  for (let i = 0; i < texto.length; i += 1) {
    valor = (valor * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return valor;
}

/** la variante de una unidad: siempre la misma para la misma clave, repartida entre todas */
export function varianteDeClave(clave: string): IdVarianteBus {
  const indice = resumen(clave) % VARIANTES_BUS.length;
  return (VARIANTES_BUS[indice] ?? VARIANTES_BUS[0]).id;
}
