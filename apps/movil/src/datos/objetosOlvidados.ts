import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_OBJETOS = 'anden.objetosOlvidados';
export const MAXIMO_DESCRIPCION = 280;

/** un objeto que la persona dejó en un bus; queda en el teléfono hasta que haya servidor para avisar al conductor */
export interface ObjetoOlvidado {
  boletoId: string;
  creadoEn: string;
  descripcion: string;
  destino: string;
  id: string;
  viajeId: string;
}

/** hace falta decir qué se olvidó, en pocas palabras */
export function descripcionValida(texto: string): boolean {
  const limpio = texto.trim();
  return limpio.length >= 3 && limpio.length <= MAXIMO_DESCRIPCION;
}

export function nuevoObjeto(
  datos: Pick<ObjetoOlvidado, 'boletoId' | 'destino' | 'viajeId'>,
  descripcion: string,
  ahora: Date = new Date(),
): ObjetoOlvidado {
  return {
    ...datos,
    creadoEn: ahora.toISOString(),
    descripcion: descripcion.trim(),
    id: `obj_${ahora.getTime()}`,
  };
}

export function objetosDeBoleto(
  lista: readonly ObjetoOlvidado[],
  boletoId: string,
): ObjetoOlvidado[] {
  return lista
    .filter((objeto) => objeto.boletoId === boletoId)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

function esObjeto(valor: unknown): valor is ObjetoOlvidado {
  if (typeof valor !== 'object' || valor === null) return false;
  const o = valor as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.boletoId === 'string' &&
    typeof o.viajeId === 'string' &&
    typeof o.destino === 'string' &&
    typeof o.descripcion === 'string' &&
    typeof o.creadoEn === 'string'
  );
}

export async function leerObjetos(): Promise<ObjetoOlvidado[]> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_OBJETOS)) ?? '[]',
    );
    return Array.isArray(valor) ? valor.filter(esObjeto) : [];
  } catch {
    return [];
  }
}

/** guarda el reporte y devuelve la lista completa */
export async function guardarObjeto(
  objeto: ObjetoOlvidado,
): Promise<ObjetoOlvidado[]> {
  const lista = [...(await leerObjetos()), objeto];
  await AsyncStorage.setItem(CLAVE_OBJETOS, JSON.stringify(lista));
  return lista;
}
