export interface PasajeroGuardado {
  cedula?: string;
  id: string;
  nombre: string;
}

/** los datos de la persona; viven solo en el teléfono */
export interface Perfil {
  apellido: string;
  cedula: string;
  correo: string;
  /** ruta local de la foto elegida de la galería */
  fotoUri: string | null;
  nombre: string;
  pasajeros: PasajeroGuardado[];
  telefono: string;
}

export const PERFIL_VACIO: Perfil = {
  apellido: '',
  cedula: '',
  correo: '',
  fotoUri: null,
  nombre: '',
  pasajeros: [],
  telefono: '',
};

export function nombreCompleto(perfil: Pick<Perfil, 'apellido' | 'nombre'>) {
  return `${perfil.nombre.trim()} ${perfil.apellido.trim()}`.trim();
}

/** hasta dos letras en mayúscula para el avatar sin foto */
export function iniciales(perfil: Pick<Perfil, 'apellido' | 'nombre'>): string {
  const letras = [perfil.nombre, perfil.apellido]
    .map((parte) => parte.trim().charAt(0).toUpperCase())
    .filter((letra) => letra !== '');
  return letras.join('');
}

export function perfilVacio(perfil: Perfil): boolean {
  return nombreCompleto(perfil) === '' && perfil.telefono.trim() === '';
}

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function correoValido(texto: string): boolean {
  return texto.trim() === '' || CORREO.test(texto.trim());
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor : '';
}

/** lee lo guardado sin confiar en su forma; lo que falte queda vacío */
export function leerPerfil(guardado: string | null): Perfil {
  if (!guardado) return PERFIL_VACIO;
  try {
    const valor = JSON.parse(guardado) as Record<string, unknown>;
    const pasajeros = Array.isArray(valor.pasajeros)
      ? (valor.pasajeros as Record<string, unknown>[])
          .filter((p) => typeof p.id === 'string' && texto(p.nombre) !== '')
          .map((p) => ({
            cedula: texto(p.cedula) || undefined,
            id: p.id as string,
            nombre: texto(p.nombre),
          }))
      : [];
    return {
      apellido: texto(valor.apellido),
      cedula: texto(valor.cedula),
      correo: texto(valor.correo),
      fotoUri: typeof valor.fotoUri === 'string' ? valor.fotoUri : null,
      nombre: texto(valor.nombre),
      pasajeros,
      telefono: texto(valor.telefono),
    };
  } catch {
    return PERFIL_VACIO;
  }
}
