import { Platform } from 'react-native';

import {
  disponibilidadDelModelo,
  responderConElModelo,
  type DisponibilidadIA,
} from '../../modules/anden-ia';

export type { DisponibilidadIA };

/** el motor de IA del teléfono: Apple Intelligence en iPhone, Gemini en Android */
export type ProveedorIA = 'apple' | 'gemini';

export interface ServicioIA {
  disponibilidad(): Promise<DisponibilidadIA>;
  /** nombre que ve la persona en los ajustes */
  nombre: string;
  preguntar(instrucciones: string, pregunta: string): Promise<string>;
  proveedor: ProveedorIA;
}

/** Apple Intelligence: el modelo corre en el teléfono y las preguntas no salen de él */
export function crearIAApple(): ServicioIA {
  return {
    disponibilidad: disponibilidadDelModelo,
    nombre: 'Apple Intelligence',
    preguntar: responderConElModelo,
    proveedor: 'apple',
  };
}

/**
 * Gemini en Android todavía no está conectado: en cuanto exista el módulo nativo reemplaza esta versión.
 * Mientras tanto dice que no está disponible en vez de fingir una respuesta.
 */
export function crearIAGemini(): ServicioIA {
  return {
    disponibilidad: async () => 'sin-modulo',
    nombre: 'Gemini',
    preguntar: async () => {
      throw new Error('sin-modulo');
    },
    proveedor: 'gemini',
  };
}

/** la IA que corresponde a este sistema */
export function iaDelSistema(): ServicioIA {
  return Platform.OS === 'android' ? crearIAGemini() : crearIAApple();
}

/** el texto de por qué no se puede usar, o nulo si se puede */
export function motivoNoDisponible(
  estado: DisponibilidadIA,
  nombre: string,
): string | null {
  switch (estado) {
    case 'disponible':
      return null;
    case 'apagada':
      return `Activá ${nombre} en los ajustes del teléfono para usar el asistente.`;
    case 'no-lista':
      return `${nombre} todavía se está preparando en el teléfono. Probá en unos minutos.`;
    case 'idioma-no-soportado':
      return `${nombre} no está disponible en el idioma de este teléfono.`;
    case 'sistema-antiguo':
      return `${nombre} necesita una versión más nueva del sistema.`;
    case 'sin-modulo':
      return `${nombre} todavía no está disponible en esta versión de la app.`;
    case 'no-compatible':
      return `Este teléfono no es compatible con ${nombre}.`;
  }
}
