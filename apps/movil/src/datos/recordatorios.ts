import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_RECORDATORIOS = 'anden.recordatorios';

/** cuántos minutos antes de la salida se puede pedir el aviso */
export const OPCIONES_MINUTOS = [15, 30, 60] as const;
export type MinutosAntes = (typeof OPCIONES_MINUTOS)[number];

const MS_MINUTO = 60_000;

/** un aviso que la persona pidió para una salida, sin tener boleto */
export interface RecordatorioSalida {
  puntoEncuentro: string;
  destino: string;
  /** identificador de la notificación programada en el teléfono */
  identificador: string;
  minutosAntes: MinutosAntes;
  /** hora de salida sin atraso, en ISO */
  salida: string;
  viajeId: string;
}

/** el instante en que suena el aviso: antes de la salida real, con el atraso incluido */
export function cuandoRecordar(
  salida: Date,
  minutosAtraso: number,
  minutosAntes: number,
): Date {
  return new Date(
    salida.getTime() + (minutosAtraso - minutosAntes) * MS_MINUTO,
  );
}

/** una opción solo sirve si su aviso todavía queda en el futuro */
export function opcionDisponible(
  salida: Date,
  minutosAtraso: number,
  minutosAntes: number,
  ahora: Date,
): boolean {
  return (
    cuandoRecordar(salida, minutosAtraso, minutosAntes).getTime() >
    ahora.getTime()
  );
}

/** quita los recordatorios de salidas que ya pasaron */
export function sinVencidos(
  lista: readonly RecordatorioSalida[],
  ahora: Date,
): RecordatorioSalida[] {
  return lista.filter(
    (recordatorio) => new Date(recordatorio.salida).getTime() > ahora.getTime(),
  );
}

/** deja uno solo por salida: el nuevo reemplaza al anterior */
export function conRecordatorio(
  lista: readonly RecordatorioSalida[],
  nuevo: RecordatorioSalida,
): RecordatorioSalida[] {
  return [
    ...lista.filter((recordatorio) => recordatorio.viajeId !== nuevo.viajeId),
    nuevo,
  ];
}

export function sinRecordatorio(
  lista: readonly RecordatorioSalida[],
  viajeId: string,
): RecordatorioSalida[] {
  return lista.filter((recordatorio) => recordatorio.viajeId !== viajeId);
}

function esRecordatorio(valor: unknown): valor is RecordatorioSalida {
  if (typeof valor !== 'object' || valor === null) return false;
  const r = valor as Record<string, unknown>;
  return (
    typeof r.viajeId === 'string' &&
    typeof r.destino === 'string' &&
    typeof r.identificador === 'string' &&
    typeof r.salida === 'string' &&
    typeof r.minutosAntes === 'number'
  );
}

export async function leerRecordatorios(): Promise<RecordatorioSalida[]> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_RECORDATORIOS)) ?? '[]',
    );
    // los recordatorios de antes de los Plus Codes traían el andén como número: quedan con el punto por confirmar
    return Array.isArray(valor)
      ? valor.filter(esRecordatorio).map((recordatorio) => ({
          ...recordatorio,
          puntoEncuentro:
            typeof recordatorio.puntoEncuentro === 'string'
              ? recordatorio.puntoEncuentro
              : '',
        }))
      : [];
  } catch {
    return [];
  }
}

export async function guardarRecordatorios(
  lista: readonly RecordatorioSalida[],
): Promise<void> {
  await AsyncStorage.setItem(CLAVE_RECORDATORIOS, JSON.stringify(lista));
}
