import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_MASCOTA = 'anden.mascota';

export type FranjaDia = 'madrugada' | 'manana' | 'noche' | 'tarde';

/** la franja del día de una hora (0 a 23) para elegir el saludo */
export function franjaDelDia(hora: number): FranjaDia {
  if (hora >= 5 && hora < 12) return 'manana';
  if (hora >= 12 && hora < 19) return 'tarde';
  if (hora >= 19) return 'noche';
  return 'madrugada';
}

/** la mascota viene encendida; solo se apaga si la persona lo decidió */
export async function leerMascotaActiva(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_MASCOTA)) !== '0';
  } catch {
    return true;
  }
}

export async function guardarMascotaActiva(activa: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_MASCOTA, activa ? '1' : '0');
}
