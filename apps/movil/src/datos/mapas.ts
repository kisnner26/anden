import { Linking } from 'react-native';

export interface LugarMapa {
  coordenadas: { lat: number; lng: number };
  nombre: string;
}

/** enlace universal de Apple Maps con indicaciones hacia el lugar; Maps pide la ubicación por su cuenta */
export function urlIndicacionesAppleMaps(lugar: LugarMapa): string {
  const { lat, lng } = lugar.coordenadas;
  // el nombre va como destino para que Maps lo muestre; las coordenadas fijan el lugar exacto
  const parametros = [
    `daddr=${encodeURIComponent(lugar.nombre)}`,
    `ll=${lat},${lng}`,
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
