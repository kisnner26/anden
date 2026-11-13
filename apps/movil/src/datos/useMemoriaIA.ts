import { createContext, useContext } from 'react';

import { MEMORIA_VACIA, type MemoriaIA } from './memoriaIA';

export interface ValorMemoriaIA {
  /** la persona deja que la IA recuerde, y la IA está activada: solo así se guarda algo */
  activa: boolean;
  /** el interruptor de la persona, aunque la IA esté apagada */
  permitida: boolean;
  cambiarPermiso: (permitida: boolean) => Promise<void>;
  memoria: MemoriaIA;
  olvidar: () => Promise<void>;
  /** anota una pregunta hecha al asistente; no hace nada si no está activa */
  recordarPregunta: (pregunta: string, destinos: readonly string[]) => void;
}

export const ContextoMemoriaIA = createContext<ValorMemoriaIA>({
  activa: false,
  cambiarPermiso: async () => undefined,
  memoria: MEMORIA_VACIA,
  olvidar: async () => undefined,
  permitida: true,
  recordarPregunta: () => undefined,
});

export function useMemoriaIA(): ValorMemoriaIA {
  return useContext(ContextoMemoriaIA);
}
