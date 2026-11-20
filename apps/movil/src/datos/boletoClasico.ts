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
