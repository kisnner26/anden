import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_FAVORITOS = 'anden.favoritos';

/** agrega el corredor si no estaba y lo quita si ya estaba */
export function alternarFavorito(
  favoritos: readonly string[],
  id: string,
): string[] {
  return favoritos.includes(id)
    ? favoritos.filter((favorito) => favorito !== id)
    : [...favoritos, id];
}

export async function leerFavoritos(): Promise<string[]> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_FAVORITOS)) ?? '[]',
    );
    return Array.isArray(valor)
      ? valor.filter((v): v is string => typeof v === 'string')
      : [];
  } catch {
    return [];
  }
}

export async function guardarFavoritos(
  favoritos: readonly string[],
): Promise<void> {
  await AsyncStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
}
