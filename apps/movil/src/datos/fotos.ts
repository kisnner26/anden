import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';

export type ResultadoFoto =
  | { tipo: 'cancelada' }
  | { tipo: 'elegida'; uri: string }
  | { tipo: 'sin-permiso' };

/** abre la galería para elegir una foto; nunca usa la cámara. `aspecto` es el encuadre del recorte, cuadrado si no se indica */
export async function elegirFotoDeGaleria(
  aspecto: [number, number] = [1, 1],
): Promise<ResultadoFoto> {
  const permiso = await requestMediaLibraryPermissionsAsync();
  if (!permiso.granted) return { tipo: 'sin-permiso' };

  const resultado = await launchImageLibraryAsync({
    allowsEditing: true,
    aspect: aspecto,
    mediaTypes: ['images'],
    quality: 0.7,
  });
  const foto = resultado.assets?.[0];
  if (resultado.canceled || !foto) return { tipo: 'cancelada' };
  return { tipo: 'elegida', uri: foto.uri };
}

/** la foto de un lado de la cédula, con el recorte del tamaño de una tarjeta (86 por 54) */
export function elegirFotoDeCedula(): Promise<ResultadoFoto> {
  return elegirFotoDeGaleria([86, 54]);
}
