import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';

import { guardarFoto } from './almacenFotos';

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
  try {
    // se copia a los documentos de la app para que no se pierda cuando el sistema vacíe lo temporal
    return { tipo: 'elegida', uri: guardarFoto(foto.uri) };
  } catch {
    return { tipo: 'elegida', uri: foto.uri };
  }
}

/** la foto de un lado de la cédula, con el recorte del tamaño de una tarjeta (86 por 54) */
export function elegirFotoDeCedula(): Promise<ResultadoFoto> {
  return elegirFotoDeGaleria([86, 54]);
}

/**
 * abre la cámara para fotografiar un objeto olvidado en el bus. Es la única función de la app que usa la cámara para tomar una foto
 * (la otra es leer el QR de un boleto), y solo la usa el chofer
 */
export async function tomarFotoDeObjeto(): Promise<ResultadoFoto> {
  const permiso = await requestCameraPermissionsAsync();
  if (!permiso.granted) return { tipo: 'sin-permiso' };
  const resultado = await launchCameraAsync({
    allowsEditing: false,
    mediaTypes: ['images'],
    quality: 0.6,
  });
  const foto = resultado.assets?.[0];
  if (resultado.canceled || !foto) return { tipo: 'cancelada' };
  try {
    return { tipo: 'elegida', uri: guardarFoto(foto.uri) };
  } catch {
    return { tipo: 'elegida', uri: foto.uri };
  }
}
