import { Linking } from 'react-native';

export interface LugarMapa {
  coordenadas: { lat: number; lng: number };
  nombre: string;
}

/** enlace universal de Apple Maps con indicaciones hacia el lugar; Maps pide la ubicación por su cuenta */
export function urlIndicacionesAppleMaps(lugar: LugarMapa): string {
  const { lat, lng } = lugar.coordenadas;
  const parametros = [
    `daddr=${lat},${lng}`,
    `q=${encodeURIComponent(lugar.nombre)}`,
    'dirflg=d',
  ];
  return `https://maps.apple.com/?${parametros.join('&')}`;
}

/** abre Apple Maps con indicaciones; devuelve false si el sistema no pudo abrirlo */
export async function abrirIndicacionesAppleMaps(
  lugar: LugarMapa,
): Promise<boolean> {
  try {
    await Linking.openURL(urlIndicacionesAppleMaps(lugar));
    return true;
  } catch {
    return false;
  }
}
