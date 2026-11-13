import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  error,
  normalizarUsuario,
  ok,
  telefonoClave,
  type Resultado,
} from '@anden/dominio';

export const CLAVE_SESION = 'anden.sesion';

export type Rol = 'conductor' | 'pasajero';

export interface Sesion {
  /** solo para el conductor: el chofer al que corresponde la cuenta */
  choferId?: string;
  nombre: string;
  rol: Rol;
  /** con lo que la persona entra además del teléfono; los conductores entran con su código */
  usuario?: string;
}

export type ErrorSesion = 'credenciales';

export interface DatosRegistro {
  apellido: string;
  clave: string;
  nombre: string;
  telefono: string;
  usuario: string;
}

export type ErrorRegistro =
  'conexion' | 'confirmacion-pendiente' | 'telefono-tomado' | 'usuario-tomado';

/**
 * lo que necesita la app de un sistema de cuentas; hoy lo cumple `crearSesionLocal` y más adelante
 * lo cumplirá Supabase Auth, con las mismas pruebas de contrato
 */
export interface ServicioSesion {
  actual(): Promise<Sesion | null>;
  cerrar(): Promise<void>;
  /** crea una cuenta de pasajero y la deja con la sesión iniciada */
  registrar(datos: DatosRegistro): Promise<Resultado<Sesion, ErrorRegistro>>;
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

/** el correo ya no sirve para entrar: solo usuario, teléfono o código */
export function esCorreo(texto: string): boolean {
  return texto.includes('@');
}

/** con qué se distingue una cuenta de otra en este teléfono: usuario, código de chofer o nombre; sin sesión no hay cuenta */
export function claveDeCuenta(sesion: Sesion | null): string | null {
  if (!sesion) return null;
  const base = sesion.usuario ?? sesion.choferId ?? sesion.nombre;
  return base.trim().toLowerCase().replace(/\s+/g, '-');
}

/** el nombre y el apellido que se pueden sacar de la sesión: la primera palabra es el nombre y el resto el apellido */
export function nombreYApellido(sesion: Sesion): {
  apellido: string;
  nombre: string;
} {
  const [nombre = '', ...resto] = sesion.nombre.trim().split(/\s+/);
  return { apellido: resto.join(' '), nombre };
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
        usuario: valor.usuario,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const CLAVE_CUENTAS = 'anden.cuentas';

interface CuentaGuardada {
  clave: string;
  sesion: Sesion;
  telefono: string;
}

async function leerCuentas(): Promise<CuentaGuardada[]> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_CUENTAS)) ?? '[]',
    );
    return Array.isArray(valor) ? (valor as CuentaGuardada[]) : [];
  } catch {
    return [];
  }
}

/** sesión guardada en el teléfono con cuentas de muestra y las que se crean aquí; sirve para desarrollo, no para producción */
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
      if (esCorreo(identificador)) return error('credenciales');
      const buscado = normalizarIdentificador(identificador);
      const telefono = telefonoClave(identificador);
      const deMuestra = cuentas.find(
        (candidata) =>
          normalizarIdentificador(candidata.identificador) === buscado &&
          candidata.clave === clave,
      );
      const creada = (await leerCuentas()).find(
        (candidata) =>
          candidata.clave === clave &&
          (candidata.sesion.usuario === buscado ||
            (telefono !== '' && candidata.telefono === telefono)),
      );
      const sesion = deMuestra?.sesion ?? creada?.sesion;
      if (!sesion) return error('credenciales');
      await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
      return ok(sesion);
    },
    async registrar(datos) {
      const usuario = normalizarUsuario(datos.usuario);
      const telefono = telefonoClave(datos.telefono);
      const existentes = await leerCuentas();
      if (
        cuentas.some(
          (muestra) =>
            normalizarIdentificador(muestra.identificador) === usuario,
        ) ||
        existentes.some((cuenta) => cuenta.sesion.usuario === usuario)
      ) {
        return error('usuario-tomado');
      }
      if (existentes.some((cuenta) => cuenta.telefono === telefono)) {
        return error('telefono-tomado');
      }
      const sesion: Sesion = {
        nombre: `${datos.nombre.trim()} ${datos.apellido.trim()}`,
        rol: 'pasajero',
        usuario,
      };
      await AsyncStorage.setItem(
        CLAVE_CUENTAS,
        JSON.stringify([
          ...existentes,
          { clave: datos.clave, sesion, telefono },
        ]),
      );
      await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
      return ok(sesion);
    },
  };
}
