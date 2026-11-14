import type { ImageSource } from 'expo-image';

import boaco from '../../assets/destinos/boaco.jpg';
import juigalpa from '../../assets/destinos/juigalpa.jpg';
import managua from '../../assets/destinos/managua.jpg';

/** nombre sin tildes ni mayúsculas, para comparar ciudades sin depender de cómo se escriban */
function clave(nombre: string): string {
  return nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

const FOTOS: Readonly<Record<string, ImageSource>> = {
  boaco,
  juigalpa,
  managua,
};

/** la foto de la ciudad si la tenemos; las demás salen sin foto hasta que se agreguen */
export function fotoDeDestino(destino: string): ImageSource | null {
  return FOTOS[clave(destino)] ?? null;
}

/** qué parte de la foto conservar cuando el marco es más ancho que alto, en porcentaje desde arriba */
const ENFOQUE_VERTICAL: Readonly<Record<string, number>> = {
  boaco: 35,
  juigalpa: 25,
  managua: 55,
};

export function enfoqueDeDestino(destino: string): number {
  return ENFOQUE_VERTICAL[clave(destino)] ?? 50;
}
