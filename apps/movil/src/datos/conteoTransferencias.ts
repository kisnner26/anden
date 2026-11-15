import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_TRANSFERENCIAS = 'anden.transferenciasDelDia';

function diaDe(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

/** cuántos boletos pasó esta persona a otra hoy; el conteo empieza de cero cada día */
export async function transferenciasDeHoy(
  ahora: Date = new Date(),
): Promise<number> {
  try {
    const guardado = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_TRANSFERENCIAS)) ?? 'null',
    ) as { dia: string; n: number } | null;
    return guardado && guardado.dia === diaDe(ahora) ? guardado.n : 0;
  } catch {
    return 0;
  }
}

export async function sumarTransferencia(
  ahora: Date = new Date(),
): Promise<void> {
  const n = (await transferenciasDeHoy(ahora)) + 1;
  await AsyncStorage.setItem(
    CLAVE_TRANSFERENCIAS,
    JSON.stringify({ dia: diaDe(ahora), n }),
  );
}
