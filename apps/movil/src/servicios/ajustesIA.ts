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

export const CLAVE_TURISTA = 'anden.iaTurista';

/** si la persona se identificó como turista: el asistente le recomienda qué visitar en cada destino */
export async function leerTurista(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_TURISTA)) === '1';
  } catch {
    return false;
  }
}

export async function guardarTurista(turista: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_TURISTA, turista ? '1' : '0');
}
