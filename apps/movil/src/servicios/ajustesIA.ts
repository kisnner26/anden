import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_AJUSTES_IA = 'anden.ia';

/** si la persona quiere usar la IA del teléfono; apagado hasta que lo active en los ajustes */
export async function leerIAActivada(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_AJUSTES_IA)) === '1';
  } catch {
    return false;
  }
}

export async function guardarIAActivada(activada: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_AJUSTES_IA, activada ? '1' : '0');
}
