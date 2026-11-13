import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cedulaValida,
  digitosTelefonoNi,
  formatearCedula,
  nombrePersonaValido,
} from '@anden/dominio';

export const CLAVE_SOLICITUD_CONDUCTOR = 'anden.solicitud-conductor';

/** en qué va la verificación; solo la cooperativa o el servidor pasan una solicitud de revisión a aprobada */
export type EstadoSolicitud = 'aprobada' | 'en-revision' | 'rechazada';

/** lo que se pide para registrarse como conductor */
export interface DatosSolicitudConductor {
  apellido: string;
  cedula: string;
  /** foto del dorso de la cédula, elegida de la galería */
  cedulaDorsoUri: string | null;
  /** foto del frente de la cédula, elegida de la galería */
  cedulaFrenteUri: string | null;
  nombre: string;
  telefono: string;
}

export interface SolicitudConductor {
  apellido: string;
  /** confirmó su identidad con Face ID, huella o el código del teléfono al registrarse */
  biometriaConfirmada: true;
  cedula: string;
  cedulaDorsoUri: string;
  cedulaFrenteUri: string;
  creadaEn: string;
  estado: EstadoSolicitud;
  nombre: string;
  telefono: string;
}

export type ErrorSolicitud =
  'apellido' | 'cedula' | 'dorso' | 'frente' | 'nombre' | 'telefono';

/** los campos que faltan o están mal; con todo bien devuelve una lista vacía. La cédula y sus dos fotos no se pueden omitir */
export function erroresDeSolicitud(
  datos: DatosSolicitudConductor,
): ErrorSolicitud[] {
  const errores: ErrorSolicitud[] = [];
  if (!nombrePersonaValido(datos.nombre)) errores.push('nombre');
  if (!nombrePersonaValido(datos.apellido)) errores.push('apellido');
  if (digitosTelefonoNi(datos.telefono) === null) errores.push('telefono');
  if (!cedulaValida(datos.cedula)) errores.push('cedula');
  if (!datos.cedulaFrenteUri) errores.push('frente');
  if (!datos.cedulaDorsoUri) errores.push('dorso');
  return errores;
}

/** arma la solicitud lista para guardar; quien llama ya comprobó que no hay errores y que se confirmó la biometría */
export function nuevaSolicitud(
  datos: DatosSolicitudConductor,
  ahora: Date = new Date(),
): SolicitudConductor {
  return {
    apellido: datos.apellido.trim(),
    biometriaConfirmada: true,
    cedula: formatearCedula(datos.cedula),
    cedulaDorsoUri: datos.cedulaDorsoUri ?? '',
    cedulaFrenteUri: datos.cedulaFrenteUri ?? '',
    creadaEn: ahora.toISOString(),
    estado: 'en-revision',
    nombre: datos.nombre.trim(),
    telefono: digitosTelefonoNi(datos.telefono) ?? '',
  };
}

function esSolicitud(valor: unknown): valor is SolicitudConductor {
  if (typeof valor !== 'object' || valor === null) return false;
  const s = valor as Record<string, unknown>;
  return (
    typeof s.nombre === 'string' &&
    typeof s.apellido === 'string' &&
    typeof s.telefono === 'string' &&
    typeof s.cedula === 'string' &&
    typeof s.cedulaFrenteUri === 'string' &&
    typeof s.cedulaDorsoUri === 'string' &&
    typeof s.creadaEn === 'string' &&
    (s.estado === 'en-revision' ||
      s.estado === 'aprobada' ||
      s.estado === 'rechazada')
  );
}

export async function leerSolicitud(): Promise<SolicitudConductor | null> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_SOLICITUD_CONDUCTOR)) ?? 'null',
    );
    return esSolicitud(valor) ? valor : null;
  } catch {
    return null;
  }
}

export async function guardarSolicitud(
  solicitud: SolicitudConductor,
): Promise<void> {
  await AsyncStorage.setItem(
    CLAVE_SOLICITUD_CONDUCTOR,
    JSON.stringify(solicitud),
  );
}

export async function descartarSolicitud(): Promise<void> {
  await AsyncStorage.removeItem(CLAVE_SOLICITUD_CONDUCTOR);
}

/** la cédula tapada salvo los últimos cuatro caracteres, para mostrarla sin exponerla */
export function cedulaOculta(cedula: string): string {
  return cedula.length <= 4
    ? cedula
    : `${'•'.repeat(cedula.length - 4)}${cedula.slice(-4)}`;
}

/**
 * lo que necesita la app para llevar la solicitud de conductor; hoy lo cumple `crearSolicitudLocal` y
 * con Supabase `crearSolicitudSupabase`, que sube las fotos al bucket privado y crea la fila en revisión
 */
export interface ServicioSolicitud {
  descartar(): Promise<void>;
  /** envía la solicitud; falla con `sin-sesion` si el servidor exige una cuenta y no hay */
  guardar(solicitud: SolicitudConductor): Promise<void>;
  leer(): Promise<SolicitudConductor | null>;
}

export function crearSolicitudLocal(): ServicioSolicitud {
  return {
    descartar: descartarSolicitud,
    guardar: guardarSolicitud,
    leer: leerSolicitud,
  };
}
