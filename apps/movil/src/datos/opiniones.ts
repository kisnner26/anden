import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_OPINIONES = 'anden:opiniones';
export const CLAVE_REPORTES = 'anden:reportes';

export const MAXIMO_COMENTARIO = 280;

export const MOTIVOS_REPORTE = [
  'manejo-peligroso',
  'cobro-indebido',
  'maltrato',
  'otro',
] as const;

export type MotivoReporte = (typeof MOTIVOS_REPORTE)[number];

export interface Opinion {
  choferId: string;
  comentario: string;
  creadaEn: string;
  estrellas: 1 | 2 | 3 | 4 | 5;
  id: string;
}

export interface Reporte {
  choferId: string;
  creadoEn: string;
  motivo: MotivoReporte;
}

/** una opinión necesita estrellas; el comentario es opcional y se recorta */
export function opinionValida(
  estrellas: number,
  comentario: string,
): estrellas is 1 | 2 | 3 | 4 | 5 {
  return (
    Number.isInteger(estrellas) &&
    estrellas >= 1 &&
    estrellas <= 5 &&
    comentario.trim().length <= MAXIMO_COMENTARIO
  );
}

/** las opiniones de un chofer, de la más nueva a la más vieja */
export function opinionesDe(
  opiniones: readonly Opinion[],
  choferId: string,
): Opinion[] {
  return opiniones
    .filter((opinion) => opinion.choferId === choferId)
    .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
}

async function leerLista<T>(clave: string): Promise<T[]> {
  try {
    const crudo = await AsyncStorage.getItem(clave);
    const datos: unknown = crudo === null ? [] : JSON.parse(crudo);
    return Array.isArray(datos) ? (datos as T[]) : [];
  } catch {
    return [];
  }
}

export function leerOpiniones(): Promise<Opinion[]> {
  return leerLista<Opinion>(CLAVE_OPINIONES);
}

export function leerReportes(): Promise<Reporte[]> {
  return leerLista<Reporte>(CLAVE_REPORTES);
}

/** guarda la opinión y devuelve la lista completa */
export async function guardarOpinion(
  nueva: Omit<Opinion, 'creadaEn' | 'id'>,
  ahora: Date = new Date(),
): Promise<Opinion[]> {
  const existentes = await leerOpiniones();
  const opinion: Opinion = {
    ...nueva,
    comentario: nueva.comentario.trim(),
    creadaEn: ahora.toISOString(),
    id: `op_${ahora.getTime()}`,
  };
  const lista = [...existentes, opinion];
  await AsyncStorage.setItem(CLAVE_OPINIONES, JSON.stringify(lista));
  return lista;
}

export async function guardarReporte(
  choferId: string,
  motivo: MotivoReporte,
  ahora: Date = new Date(),
): Promise<void> {
  const existentes = await leerReportes();
  const lista: Reporte[] = [
    ...existentes,
    { choferId, creadoEn: ahora.toISOString(), motivo },
  ];
  await AsyncStorage.setItem(CLAVE_REPORTES, JSON.stringify(lista));
}
