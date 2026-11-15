import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/** el Llavero limita cada valor; la sesión de Supabase es más larga, así que se parte en trozos */
const TROZO = 1800;

/** SecureStore solo admite letras, números, punto, guion y guion bajo en la clave */
function claveSegura(clave: string): string {
  return clave.replace(/[^\w.-]/g, '_');
}

async function leerTrozos(clave: string): Promise<string | null> {
  const base = claveSegura(clave);
  const cuenta = await SecureStore.getItemAsync(`${base}.n`);
  if (cuenta === null) return null;
  const partes: string[] = [];
  for (let i = 0; i < Number(cuenta); i += 1) {
    const parte = await SecureStore.getItemAsync(`${base}.${i}`);
    if (parte === null) return null;
    partes.push(parte);
  }
  return partes.join('');
}

async function borrarTrozos(clave: string): Promise<void> {
  const base = claveSegura(clave);
  const cuenta = Number((await SecureStore.getItemAsync(`${base}.n`)) ?? 0);
  for (let i = 0; i < cuenta; i += 1) {
    await SecureStore.deleteItemAsync(`${base}.${i}`);
  }
  await SecureStore.deleteItemAsync(`${base}.n`);
}

/**
 * dónde guarda Supabase la sesión: en el Llavero del teléfono y no en el almacenamiento común, porque ahí viven los
 * tokens que dan acceso a la cuenta. Si la sesión quedó guardada de antes en el almacenamiento común, se pasa al
 * Llavero y se borra de allí, para que nadie tenga que volver a entrar.
 */
export const almacenSeguro = {
  async getItem(clave: string): Promise<string | null> {
    try {
      const guardado = await leerTrozos(clave);
      if (guardado !== null) return guardado;
    } catch {
      return null;
    }
    const antiguo = await AsyncStorage.getItem(clave);
    if (antiguo !== null) {
      try {
        await almacenSeguro.setItem(clave, antiguo);
        await AsyncStorage.removeItem(clave);
      } catch {
        // si el Llavero no responde, la sesión sigue funcionando desde donde estaba
      }
    }
    return antiguo;
  },
  async removeItem(clave: string): Promise<void> {
    await borrarTrozos(clave).catch(() => undefined);
    await AsyncStorage.removeItem(clave);
  },
  async setItem(clave: string, valor: string): Promise<void> {
    await borrarTrozos(clave);
    const base = claveSegura(clave);
    const total = Math.max(1, Math.ceil(valor.length / TROZO));
    for (let i = 0; i < total; i += 1) {
      await SecureStore.setItemAsync(
        `${base}.${i}`,
        valor.slice(i * TROZO, (i + 1) * TROZO),
      );
    }
    await SecureStore.setItemAsync(`${base}.n`, String(total));
  },
};
