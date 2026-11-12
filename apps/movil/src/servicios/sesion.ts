import AsyncStorage from '@react-native-async-storage/async-storage';
import { error, ok, type Resultado } from '@anden/dominio';

export const CLAVE_SESION = 'anden.sesion';

export type Rol = 'conductor' | 'pasajero';

export interface Sesion {
  /** solo para el conductor: el chofer al que corresponde la cuenta */
  choferId?: string;
  nombre: string;
  rol: Rol;
}

export type ErrorSesion = 'credenciales';

/**
 * lo que necesita la app de un sistema de cuentas; hoy lo cumple `crearSesionLocal` y más adelante
 * lo cumplirá Supabase Auth, con las mismas pruebas de contrato
 */
export interface ServicioSesion {
  actual(): Promise<Sesion | null>;
  cerrar(): Promise<void>;
  /** entra con las credenciales; el rol lo decide quien guarda la cuenta, no la persona que entra */
  iniciar(
    identificador: string,
    clave: string,
  ): Promise<Resultado<Sesion, ErrorSesion>>;
}

/** una cuenta de muestra: con qué se entra y a quién corresponde */
export interface CuentaMuestra {
  clave: string;
  /** correo, teléfono o código de chofer, como lo escribe quien entra */
  identificador: string;
  sesion: Sesion;
}

/** minúsculas, sin espacios ni guiones, para comparar lo escrito con lo guardado */
export function normalizarIdentificador(texto: string): string {
  return texto.trim().toLowerCase().replace(/[\s-]/g, '');
}

/** el pasajero no necesita iniciar sesión: sin sesión se comporta como pasajero */
export function rolDe(sesion: Sesion | null): Rol {
  return sesion?.rol ?? 'pasajero';
}

function leer(texto: string | null): Sesion | null {
  if (!texto) return null;
  try {
    const valor = JSON.parse(texto) as Partial<Sesion>;
    if (
      (valor.rol === 'conductor' || valor.rol === 'pasajero') &&
      typeof valor.nombre === 'string'
    ) {
      return {
        choferId: valor.choferId,
        nombre: valor.nombre,
        rol: valor.rol,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** sesión guardada en el teléfono con cuentas de muestra de los dos roles; sirve para desarrollo, no para producción */
export function crearSesionLocal(
  cuentas: readonly CuentaMuestra[],
): ServicioSesion {
  return {
    async actual() {
      try {
        return leer(await AsyncStorage.getItem(CLAVE_SESION));
      } catch {
        return null;
      }
    },
    async cerrar() {
      await AsyncStorage.removeItem(CLAVE_SESION);
    },
    async iniciar(identificador, clave) {
      const buscado = normalizarIdentificador(identificador);
      const cuenta = cuentas.find(
        (candidata) =>
          normalizarIdentificador(candidata.identificador) === buscado &&
          candidata.clave === clave,
      );
      if (!cuenta) return error('credenciales');
      await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(cuenta.sesion));
      return ok(cuenta.sesion);
    },
  };
}

export const CLAVE_INVITADO = 'anden.invitado';

/** quien prefiere usar la app sin cuenta; se recuerda para no volver a mostrar el ingreso */
export async function marcarInvitado(): Promise<void> {
  await AsyncStorage.setItem(CLAVE_INVITADO, '1');
}

export async function esInvitado(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_INVITADO)) === '1';
  } catch {
    return false;
  }
}

export async function olvidarInvitado(): Promise<void> {
  await AsyncStorage.removeItem(CLAVE_INVITADO);
}
