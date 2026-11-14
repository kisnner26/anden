import type { ImageSourcePropType } from 'react-native';

import boaco from '../../assets/destinos/boaco.jpg';
import juigalpa from '../../assets/destinos/juigalpa.jpg';
import managua from '../../assets/destinos/managua.jpg';

/** nombre sin tildes ni mayúsculas, para comparar ciudades sin depender de cómo se escriban */
function clave(nombre: string): string {
  return nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

const FOTOS: Readonly<Record<string, ImageSourcePropType>> = {
  boaco,
  juigalpa,
  managua,
};

/** la foto de la ciudad si la tenemos; las demás salen sin foto hasta que se agreguen */
export function fotoDeDestino(destino: string): ImageSourcePropType | null {
  return FOTOS[clave(destino)] ?? null;
}
