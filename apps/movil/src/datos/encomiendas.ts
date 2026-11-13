import AsyncStorage from '@react-native-async-storage/async-storage';
import { digitosTelefonoNi } from '@anden/dominio';

export const CLAVE_ENCOMIENDAS = 'anden.encomiendas';
export const TAMANOS = ['sobre', 'pequeno', 'grande'] as const;
export type TamanoEncomienda = (typeof TAMANOS)[number];

/** una solicitud de envío por bus; queda en el teléfono hasta que la cooperativa la confirme con el servidor */
export interface Encomienda {
  codigo: string;
  creadaEn: string;
  descripcion: string;
  destinatario: string;
  destino: string;
  estado: 'solicitada';
  /** se marca para que lo cuiden más; los envíos guardados antes de este campo no lo tienen */
  fragil: boolean;
  id: string;
  origen: string;
  remitente: string;
  tamano: TamanoEncomienda;
  /** los 8 dígitos nacionales de quien recibe */
  telefonoDestinatario: string;
}

export interface DatosEncomienda {
  descripcion: string;
  destinatario: string;
  destino: string;
  fragil?: boolean;
  origen: string;
  remitente: string;
  tamano: TamanoEncomienda;
  telefonoDestinatario: string;
}

export type ErrorEncomienda =
  'descripcion' | 'destinatario' | 'remitente' | 'telefono';

/** los campos que no sirven, para marcarlos en el formulario */
export function erroresDeEncomienda(datos: DatosEncomienda): ErrorEncomienda[] {
  const errores: ErrorEncomienda[] = [];
  if (datos.remitente.trim().length < 2) errores.push('remitente');
  if (datos.destinatario.trim().length < 2) errores.push('destinatario');
  if (digitosTelefonoNi(datos.telefonoDestinatario) === null) {
    errores.push('telefono');
  }
  if (datos.descripcion.trim().length < 3) errores.push('descripcion');
  return errores;
}

const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** un código corto para seguir la solicitud, sin letras que se confunden */
export function codigoEncomienda(semilla: number): string {
  let resto = Math.abs(Math.floor(semilla));
  let codigo = '';
  for (let i = 0; i < 6; i += 1) {
    codigo += LETRAS[resto % LETRAS.length];
    resto = Math.floor(resto / LETRAS.length) + 7 * (i + 1);
  }
  return `ENC-${codigo}`;
}

export function nuevaEncomienda(
  datos: DatosEncomienda,
  ahora: Date = new Date(),
): Encomienda {
  return {
    codigo: codigoEncomienda(ahora.getTime()),
    creadaEn: ahora.toISOString(),
    descripcion: datos.descripcion.trim(),
    destinatario: datos.destinatario.trim(),
    destino: datos.destino,
    estado: 'solicitada',
    fragil: datos.fragil === true,
    id: `enc_${ahora.getTime()}`,
    origen: datos.origen,
    remitente: datos.remitente.trim(),
    tamano: datos.tamano,
    telefonoDestinatario: digitosTelefonoNi(datos.telefonoDestinatario) ?? '',
  };
}

function esEncomienda(valor: unknown): valor is Encomienda {
  if (typeof valor !== 'object' || valor === null) return false;
  const e = valor as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.codigo === 'string' &&
    typeof e.origen === 'string' &&
    typeof e.destino === 'string' &&
    typeof e.remitente === 'string' &&
    typeof e.destinatario === 'string' &&
    typeof e.descripcion === 'string' &&
    typeof e.creadaEn === 'string' &&
    typeof e.telefonoDestinatario === 'string' &&
    (TAMANOS as readonly unknown[]).includes(e.tamano)
  );
}

export async function leerEncomiendas(): Promise<Encomienda[]> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_ENCOMIENDAS)) ?? '[]',
    );
    return Array.isArray(valor)
      ? valor
          .filter(esEncomienda)
          .map((e) => ({ ...e, fragil: e.fragil === true }))
      : [];
  } catch {
    return [];
  }
}

/** guarda la solicitud y devuelve la lista, la más nueva primero */
export async function guardarEncomienda(
  encomienda: Encomienda,
): Promise<Encomienda[]> {
  const lista = [encomienda, ...(await leerEncomiendas())];
  await AsyncStorage.setItem(CLAVE_ENCOMIENDAS, JSON.stringify(lista));
  return lista;
}

/** el texto del comprobante para compartir: código, trayecto y qué lleva */
export function mensajeComprobante(e: Encomienda): string {
  return `Encomienda ${e.codigo} por bus de ${e.origen} a ${e.destino}. De ${e.remitente} para ${e.destinatario}: ${e.descripcion}${e.fragil ? ' (frágil)' : ''}. Con este código se reclama el paquete.`;
}

/** enlace para abrir Mensajes con el aviso a quien recibe ya escrito; la persona lo revisa y lo envía */
export function urlSmsDestinatario(e: Encomienda): string {
  const mensaje = `Hola ${e.destinatario}, te mando una encomienda por bus de ${e.origen} a ${e.destino}. Código ${e.codigo}.`;
  return `sms:+505${e.telefonoDestinatario}&body=${encodeURIComponent(mensaje)}`;
}
