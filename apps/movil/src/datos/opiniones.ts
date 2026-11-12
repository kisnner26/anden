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
  /** el boleto del viaje que respalda la opinión; falta en las guardadas antes de pedirlo */
  boletoId?: string;
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

export interface BoletoParaOpinar {
  estado: string;
  id: string;
  viajeId: string;
}

export interface ViajeParaOpinar {
  choferId: string;
  id: string;
  salida: string;
}

/**
 * el boleto con el que se puede opinar sobre un chofer: no cancelado, de un viaje suyo que ya
 * salió, y sin opinión previa; una opinión por boleto. nulo si no hay ninguno.
 */
export function boletoParaOpinar(
  boletos: readonly BoletoParaOpinar[],
  viajes: readonly ViajeParaOpinar[],
  choferId: string,
  opiniones: readonly Opinion[],
  ahora: Date,
): string | null {
  const usados = new Set(opiniones.map((opinion) => opinion.boletoId));
  const elegible = boletos.find((boleto) => {
    if (boleto.estado === 'cancelado' || usados.has(boleto.id)) return false;
    const viaje = viajes.find((candidato) => candidato.id === boleto.viajeId);
    return (
      viaje !== undefined &&
      viaje.choferId === choferId &&
      new Date(viaje.salida).getTime() <= ahora.getTime()
    );
  });
  return elegible?.id ?? null;
}

export interface NotaChofer {
  promedio: number | null;
  total: number;
}

/**
 * suma las opiniones de este teléfono a la nota del chofer; sin nota base solo se muestra una
 * nota si hay al menos cinco, igual que en el dominio
 */
export function notaConOpiniones(
  base: NotaChofer,
  propias: readonly Opinion[],
): NotaChofer {
  const total = base.total + propias.length;
  const sumaPropias = propias.reduce((suma, o) => suma + o.estrellas, 0);
  if (base.promedio !== null) {
    const media = (base.promedio * base.total + sumaPropias) / total;
    return { promedio: Math.round(media * 10) / 10, total };
  }
  if (propias.length < 5) return { promedio: null, total };
  return {
    promedio: Math.round((sumaPropias / propias.length) * 10) / 10,
    total,
  };
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
