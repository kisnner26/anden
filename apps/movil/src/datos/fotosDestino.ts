import type { ImageSource } from 'expo-image';

import boaco from '../../assets/destinos/boaco.jpg';
import boacoArco from '../../assets/destinos/boaco/arco.jpg';
import boacoIglesia from '../../assets/destinos/boaco/iglesia.jpg';
import boacoMirador from '../../assets/destinos/boaco/mirador.jpg';
import juigalpa from '../../assets/destinos/juigalpa.jpg';
import juigalpaColina from '../../assets/destinos/juigalpa/colina.jpg';
import juigalpaMuseo from '../../assets/destinos/juigalpa/museo.jpg';
import juigalpaPuma from '../../assets/destinos/juigalpa/puma.jpg';
import juigalpaRisco from '../../assets/destinos/juigalpa/risco.jpg';
import managua from '../../assets/destinos/managua.jpg';
import managuaCatedral from '../../assets/destinos/managua/catedral.jpg';
import managuaNoche from '../../assets/destinos/managua/noche.jpg';
import managuaPuerto from '../../assets/destinos/managua/puerto.jpg';

/** nombre sin tildes ni mayúsculas, para comparar ciudades sin depender de cómo se escriban */
function clave(nombre: string): string {
  return nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

export interface FotoDeCiudad {
  descripcion: string;
  /** qué parte de la foto conservar cuando el marco es más ancho que alto, en porcentaje desde arriba */
  enfoque: number;
  fuente: ImageSource;
  /** palabras con las que alguien pediría ver este lugar, sin tildes */
  etiquetas: readonly string[];
  titulo: string;
}

/** varias fotos por ciudad, todas horizontales y con su punto de enfoque para que lo importante quede dentro del marco */
const FOTOS: Readonly<Record<string, readonly FotoDeCiudad[]>> = {
  boaco: [
    {
      descripcion:
        'Vista de la ciudad de Boaco, conocida como la ciudad de dos pisos.',
      enfoque: 35,
      etiquetas: ['ciudad', 'vista', 'panoramica', 'dos pisos'],
      fuente: boaco,
      titulo: 'Boaco, la ciudad de dos pisos',
    },
    {
      descripcion: 'Arco de Boaco, uno de sus puntos más fotografiados.',
      enfoque: 42,
      etiquetas: ['arco', 'entrada', 'monumento'],
      fuente: boacoArco,
      titulo: 'El arco de Boaco',
    },
    {
      descripcion: 'Mirador de Boaco, con vista a la ciudad y a su valle.',
      enfoque: 38,
      etiquetas: ['mirador', 'vista', 'paisaje', 'naturaleza'],
      fuente: boacoMirador,
      titulo: 'Mirador de Boaco',
    },
    {
      descripcion: 'Iglesia de Boaco, en el centro histórico de la ciudad.',
      enfoque: 50,
      etiquetas: ['iglesia', 'centro', 'historico', 'catedral', 'parque'],
      fuente: boacoIglesia,
      titulo: 'Iglesia de Boaco',
    },
  ],
  juigalpa: [
    {
      descripcion: 'Vista de Juigalpa, cabecera del departamento de Chontales.',
      enfoque: 25,
      etiquetas: ['ciudad', 'vista', 'panoramica'],
      fuente: juigalpa,
      titulo: 'Juigalpa, Chontales',
    },
    {
      descripcion: 'La colina sobre Juigalpa, con vista a la ciudad.',
      enfoque: 55,
      etiquetas: [
        'colina',
        'cerro',
        'mirador',
        'vista',
        'paisaje',
        'naturaleza',
      ],
      fuente: juigalpaColina,
      titulo: 'Colina de Juigalpa',
    },
    {
      descripcion: 'El puma, símbolo de Juigalpa.',
      enfoque: 50,
      etiquetas: ['puma', 'estatua', 'monumento', 'simbolo'],
      fuente: juigalpaPuma,
      titulo: 'El puma de Juigalpa',
    },
    {
      descripcion:
        'Risco de Juigalpa, un punto para mirar el paisaje de Chontales.',
      enfoque: 42,
      etiquetas: ['risco', 'roca', 'mirador', 'paisaje', 'naturaleza'],
      fuente: juigalpaRisco,
      titulo: 'Risco de Juigalpa',
    },
    {
      descripcion:
        'Museo Arqueológico Gregorio Aguilar Barea, con estatuaria precolombina.',
      enfoque: 50,
      etiquetas: ['museo', 'arqueologico', 'estatuas', 'historia', 'cultura'],
      fuente: juigalpaMuseo,
      titulo: 'Museo Arqueológico de Juigalpa',
    },
  ],
  managua: [
    {
      descripcion:
        'Vista de Managua, capital de Nicaragua, junto al lago Xolotlán.',
      enfoque: 55,
      etiquetas: ['ciudad', 'vista', 'panoramica', 'capital'],
      fuente: managua,
      titulo: 'Managua, la capital',
    },
    {
      descripcion:
        'Catedral Metropolitana de la Inmaculada Concepción, inaugurada en 1993.',
      enfoque: 55,
      etiquetas: ['catedral', 'iglesia', 'centro', 'historico'],
      fuente: managuaCatedral,
      titulo: 'Catedral de Managua',
    },
    {
      descripcion:
        'Puerto Salvador Allende, el malecón a orillas del lago Xolotlán.',
      enfoque: 50,
      etiquetas: ['puerto', 'malecon', 'lago', 'xolotlan', 'paseo'],
      fuente: managuaPuerto,
      titulo: 'Puerto Salvador Allende',
    },
    {
      descripcion: 'Managua iluminada de noche.',
      enfoque: 55,
      etiquetas: ['noche', 'luces', 'nocturna', 'ciudad'],
      fuente: managuaNoche,
      titulo: 'Managua de noche',
    },
  ],
};

/** un número estable a partir de cualquier texto, para que la misma tarjeta siempre muestre la misma foto */
function indiceDe(
  variante: number | string | undefined,
  total: number,
): number {
  if (variante === undefined) return 0;
  if (typeof variante === 'number')
    return Math.abs(Math.trunc(variante)) % total;
  let h = 0;
  for (let i = 0; i < variante.length; i += 1) {
    h = (h * 31 + variante.charCodeAt(i)) >>> 0;
  }
  return h % total;
}

function elegir(
  destino: string,
  variante?: number | string,
): FotoDeCiudad | null {
  const lista = FOTOS[clave(destino)];
  if (!lista || lista.length === 0) return null;
  return lista[indiceDe(variante, lista.length)] ?? null;
}

/**
 * la foto de la ciudad si la tenemos; con `variante` (un número o un texto, como el id de un viaje) se reparten las
 * distintas fotos de la ciudad para que las listas no repitan siempre la misma. Las demás salen sin foto
 */
export function fotoDeDestino(
  destino: string,
  variante?: number | string,
): ImageSource | null {
  return elegir(destino, variante)?.fuente ?? null;
}

export function enfoqueDeDestino(
  destino: string,
  variante?: number | string,
): number {
  return elegir(destino, variante)?.enfoque ?? 50;
}

/** cuántas fotos hay de una ciudad */
export function cantidadDeFotos(destino: string): number {
  return FOTOS[clave(destino)]?.length ?? 0;
}

/** todas las fotos de una ciudad con su título, descripción y etiquetas */
export function fotosDeCiudad(destino: string): readonly FotoDeCiudad[] {
  return FOTOS[clave(destino)] ?? [];
}

/** las ciudades que tienen fotos, con su nombre en minúsculas y sin tildes */
export function ciudadesConFotos(): string[] {
  return Object.keys(FOTOS);
}
