import { Platform } from 'react-native';

import {
  conversarConElModelo,
  disponibilidadDelModelo,
  olvidarConversacion,
  precalentarModelo,
  responderConElModelo,
  sabeConversar,
  type DisponibilidadIA,
  type PedidoConversacion,
} from '../../modules/anden-ia';

export type { DisponibilidadIA, PedidoConversacion };

/** el motor de IA del teléfono: Apple Intelligence en iPhone, Gemini en Android */
export type ProveedorIA = 'apple' | 'gemini';

export interface ServicioIA {
  /** conversación con herramientas y respuesta estructurada; solo donde el sistema la ofrece */
  conversar?: (pedido: PedidoConversacion) => Promise<string>;
  disponibilidad(): Promise<DisponibilidadIA>;
  /** nombre que ve la persona en los ajustes */
  nombre: string;
  /** olvida lo hablado en una conversación */
  olvidar?: (conversacion: string) => Promise<void>;
  /** carga el modelo por adelantado para que la primera respuesta no tarde */
  precalentar?: (conversacion: string, instrucciones: string) => Promise<void>;
  preguntar(instrucciones: string, pregunta: string): Promise<string>;
  proveedor: ProveedorIA;
}

/** Apple Intelligence: el modelo corre en el teléfono y las preguntas no salen de él */
export function crearIAApple(): ServicioIA {
  return {
    ...(sabeConversar
      ? {
          conversar: conversarConElModelo,
          olvidar: olvidarConversacion,
          precalentar: precalentarModelo,
        }
      : {}),
    disponibilidad: disponibilidadDelModelo,
    nombre: 'Apple Intelligence',
    preguntar: responderConElModelo,
    proveedor: 'apple',
  };
}

/** Gemini Nano en Android: corre en el teléfono por AICore y las preguntas no salen de él */
export function crearIAGemini(): ServicioIA {
  return {
    disponibilidad: disponibilidadDelModelo,
    nombre: 'Gemini',
    preguntar: responderConElModelo,
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
