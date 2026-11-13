import AsyncStorage from '@react-native-async-storage/async-storage';
import { digitosTelefonoNi } from '@anden/dominio';

export const CLAVE_CONTACTO = 'anden.contactoConfianza';

/** la persona a la que se le avisa cómo va el viaje */
export interface ContactoConfianza {
  nombre: string;
  /** los 8 dígitos nacionales */
  telefono: string;
}

/** valida el nombre y el teléfono de Nicaragua; nulo si algo no sirve */
export function armarContacto(
  nombre: string,
  telefono: string,
): ContactoConfianza | null {
  const digitos = digitosTelefonoNi(telefono);
  if (nombre.trim().length < 2 || digitos === null) return null;
  return { nombre: nombre.trim(), telefono: digitos };
}

/** el enlace que abre el viaje dentro de Andén: quien lo recibe lo toca y ve la salida, la unidad y por dónde va */
export function enlaceDeViaje(viajeId: string): string {
  return `anden://viaje/${viajeId}`;
}

export interface DatosMensaje {
  chofer: string;
  destino: string;
  /** enlace al viaje, ver `enlaceDeViaje` */
  enlace: string;
  /** hora de llegada ya escrita, por ejemplo 3:26 p. m. */
  llegada: string;
  placa: string;
  /** hora de salida ya escrita, por ejemplo 1:45 p. m. */
  salida: string;
}

/** el texto que se manda: a dónde va, en qué unidad y a qué hora llega; sin el código del boleto */
export function mensajeDeViaje(datos: DatosMensaje): string {
  return `Voy en el bus a ${datos.destino}. Sale a las ${datos.salida}, llega más o menos a las ${datos.llegada}. Placa ${datos.placa}, chofer ${datos.chofer}.\nSeguí mi viaje en Andén: ${datos.enlace}`;
}

/** enlace para abrir Mensajes con el texto ya escrito; la persona lo revisa y lo envía */
export function urlSms(contacto: ContactoConfianza, mensaje: string): string {
  return `sms:+505${contacto.telefono}&body=${encodeURIComponent(mensaje)}`;
}

export async function leerContacto(): Promise<ContactoConfianza | null> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_CONTACTO)) ?? 'null',
    );
    if (typeof valor !== 'object' || valor === null) return null;
    const c = valor as Record<string, unknown>;
    return typeof c.nombre === 'string' && typeof c.telefono === 'string'
      ? { nombre: c.nombre, telefono: c.telefono }
      : null;
  } catch {
    return null;
  }
}

export async function guardarContacto(
  contacto: ContactoConfianza,
): Promise<void> {
  await AsyncStorage.setItem(CLAVE_CONTACTO, JSON.stringify(contacto));
}
