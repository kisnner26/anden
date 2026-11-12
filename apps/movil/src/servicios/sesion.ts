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
  iniciarComoConductor(
    codigo: string,
    clave: string,
  ): Promise<Resultado<Sesion, ErrorSesion>>;
}

export interface CuentaConductor {
  choferId: string;
  clave: string;
  codigo: string;
  nombre: string;
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

/** sesión guardada en el teléfono con cuentas de conductor de muestra; sirve para desarrollo, no para producción */
export function crearSesionLocal(
  cuentas: readonly CuentaConductor[],
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
    async iniciarComoConductor(codigo, clave) {
      const cuenta = cuentas.find(
        (candidata) =>
          candidata.codigo === codigo.trim() && candidata.clave === clave,
      );
      if (!cuenta) return error('credenciales');
      const sesion: Sesion = {
        choferId: cuenta.choferId,
        nombre: cuenta.nombre,
        rol: 'conductor',
      };
      await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
      return ok(sesion);
    },
  };
}
