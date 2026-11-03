import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';

export type ResultadoFoto =
  | { tipo: 'cancelada' }
  | { tipo: 'elegida'; uri: string }
  | { tipo: 'sin-permiso' };

/** abre la galería para elegir una foto cuadrada; nunca usa la cámara */
export async function elegirFotoDeGaleria(): Promise<ResultadoFoto> {
  const permiso = await requestMediaLibraryPermissionsAsync();
  if (!permiso.granted) return { tipo: 'sin-permiso' };

  const resultado = await launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ['images'],
    quality: 0.7,
  });
  const foto = resultado.assets?.[0];
  if (resultado.canceled || !foto) return { tipo: 'cancelada' };
  return { tipo: 'elegida', uri: foto.uri };
}
