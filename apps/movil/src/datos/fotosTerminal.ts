import type { ImageSource } from 'expo-image';

import cadena from '../../assets/terminales/cadena.jpg';
import mayales from '../../assets/terminales/mayales.jpg';
import mayoreo from '../../assets/terminales/mayoreo.jpg';

const FOTOS: Readonly<Record<string, ImageSource>> = {
  ter_boa: cadena,
  ter_jui: mayales,
  ter_may: mayoreo,
};

/** la foto de la terminal si la tenemos; las demás salen con el código de siempre */
export function fotoDeTerminal(terminalId: string): ImageSource | null {
  return FOTOS[terminalId] ?? null;
}
