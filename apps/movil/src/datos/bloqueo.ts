import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_BLOQUEO = 'anden.bloqueo';

/** tiempo fuera de la app antes de pedir Face ID de nuevo */
export const SEGUNDOS_GRACIA = 60;

/** se bloquea solo si el bloqueo está activo y la persona estuvo fuera el tiempo de gracia o más */
export function debeBloquear(activo: boolean, segundosFuera: number): boolean {
  return activo && segundosFuera >= SEGUNDOS_GRACIA;
}

export async function leerBloqueoActivo(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_BLOQUEO)) === '1';
  } catch {
    return false;
  }
}

export async function guardarBloqueoActivo(activo: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_BLOQUEO, activo ? '1' : '0');
}
