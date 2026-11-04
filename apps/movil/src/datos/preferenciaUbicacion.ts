import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_UBICACION_AUTOMATICA = 'anden:ubicacion-automatica';

export async function leerUbicacionAutomatica(): Promise<boolean> {
  return (await AsyncStorage.getItem(CLAVE_UBICACION_AUTOMATICA)) === '1';
}

export async function guardarUbicacionAutomatica(
  activada: boolean,
): Promise<void> {
  await AsyncStorage.setItem(CLAVE_UBICACION_AUTOMATICA, activada ? '1' : '0');
}
