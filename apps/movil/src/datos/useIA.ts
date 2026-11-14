import { createContext, useContext } from 'react';

import type {
  DisponibilidadIA,
  PedidoConversacion,
  ServicioIA,
} from '@/servicios/ia';

export interface ValorIA {
  /** la persona la encendió en los ajustes */
  activada: boolean;
  cambiar: (activada: boolean) => Promise<void>;
  /** todavía se está leyendo qué permite este teléfono */
  cargando: boolean;
  /** conversa con herramientas y respuesta estructurada; ausente donde el sistema no la ofrece */
  conversar?: (pedido: PedidoConversacion) => Promise<string>;
  disponibilidad: DisponibilidadIA;
  /** Apple Intelligence o Gemini, según el sistema */
  nombre: string;
  olvidar?: (conversacion: string) => Promise<void>;
  precalentar?: (conversacion: string, instrucciones: string) => Promise<void>;
  /** responde con los datos que se le pasan; falla si no se puede usar */
  preguntar: (instrucciones: string, pregunta: string) => Promise<string>;
  /** activada por la persona y disponible en el teléfono: ya se puede mostrar el asistente */
  usable: boolean;
}

export const ContextoIA = createContext<ValorIA>({
  activada: false,
  cambiar: async () => undefined,
  cargando: false,
  disponibilidad: 'sin-modulo',
  nombre: 'Apple Intelligence',
  preguntar: async () => {
    throw new Error('sin-modulo');
  },
  usable: false,
});

export function useIA(): ValorIA {
  return useContext(ContextoIA);
}

export type { ServicioIA };
