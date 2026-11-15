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

interface FotoDeCiudad {
  /** qué parte de la foto conservar cuando el marco es más ancho que alto, en porcentaje desde arriba */
  enfoque: number;
  fuente: ImageSource;
}

/** varias fotos por ciudad, todas horizontales y con su punto de enfoque para que lo importante quede dentro del marco */
const FOTOS: Readonly<Record<string, readonly FotoDeCiudad[]>> = {
  boaco: [
    { enfoque: 35, fuente: boaco },
    { enfoque: 42, fuente: boacoArco },
    { enfoque: 38, fuente: boacoMirador },
    { enfoque: 50, fuente: boacoIglesia },
  ],
  juigalpa: [
    { enfoque: 25, fuente: juigalpa },
    { enfoque: 55, fuente: juigalpaColina },
    { enfoque: 50, fuente: juigalpaPuma },
    { enfoque: 42, fuente: juigalpaRisco },
    { enfoque: 50, fuente: juigalpaMuseo },
  ],
  managua: [
    { enfoque: 55, fuente: managua },
    { enfoque: 55, fuente: managuaCatedral },
    { enfoque: 50, fuente: managuaPuerto },
    { enfoque: 55, fuente: managuaNoche },
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
