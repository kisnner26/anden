import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_BOLETO_CLASICO = 'anden.boletoClasico';

/** si la persona eligió ver el boleto como el de papel de la cooperativa; por defecto no */
export async function leerBoletoClasico(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_BOLETO_CLASICO)) === '1';
  } catch {
    return false;
  }
}

const oyentes = new Set<(activo: boolean) => void>();

/** guarda la elección y avisa al instante a las pantallas que la están mostrando */
export async function guardarBoletoClasico(activo: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_BOLETO_CLASICO, activo ? '1' : '0');
  for (const oyente of oyentes) oyente(activo);
}
