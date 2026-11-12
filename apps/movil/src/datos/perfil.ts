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
  /** años cumplidos; solo sirve para adaptar la interfaz */
  edad: number | null;
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
  edad: null,
  fotoUri: null,
  nombre: '',
  pasajeros: [],
  telefono: '',
};

export function nombreCompleto(perfil: Pick<Perfil, 'apellido' | 'nombre'>) {
  return `${perfil.nombre.trim()} ${perfil.apellido.trim()}`.trim();
}

const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y']);

/**
 * el nombre listo para mostrar: cada palabra empieza con mayúscula y el resto queda como se
 * escribió; las partículas (de, del, la...) en medio del nombre quedan en minúscula. No se usa
 * al guardar: lo que escribió la persona no se modifica.
 */
export function nombrePropio(texto: string): string {
  return texto
    .trim()
    .split(/\s+/)
    .filter((palabra) => palabra !== '')
    .map((palabra, indice) => {
      if (indice > 0 && PARTICULAS.has(palabra.toLocaleLowerCase('es'))) {
        return palabra.toLocaleLowerCase('es');
      }
      return palabra.charAt(0).toLocaleUpperCase('es') + palabra.slice(1);
    })
    .join(' ');
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

export const EDAD_MINIMA = 5;
export const EDAD_MAXIMA = 110;
/** desde esta edad la interfaz se adapta sola: letra más legible y menos pasos */
export const EDAD_MAYOR = 60;

export function edadValida(valor: unknown): valor is number {
  return (
    typeof valor === 'number' &&
    Number.isInteger(valor) &&
    valor >= EDAD_MINIMA &&
    valor <= EDAD_MAXIMA
  );
}

/** la edad escrita en un campo: vacío es válido (es opcional) y devuelve nulo */
export function leerEdad(texto: string): {
  valida: boolean;
  valor: number | null;
} {
  const limpio = texto.trim();
  if (limpio === '') return { valida: true, valor: null };
  const numero = Number(limpio);
  return edadValida(numero)
    ? { valida: true, valor: numero }
    : { valida: false, valor: null };
}

export function esPersonaMayor(edad: number | null): boolean {
  return edad !== null && edad >= EDAD_MAYOR;
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
      edad: edadValida(valor.edad) ? valor.edad : null,
      fotoUri: typeof valor.fotoUri === 'string' ? valor.fotoUri : null,
      nombre: texto(valor.nombre),
      pasajeros,
      telefono: texto(valor.telefono),
    };
  } catch {
    return PERFIL_VACIO;
  }
}
