import { requireOptionalNativeModule } from 'expo';

/** por qué se puede o no usar el modelo del teléfono */
export type DisponibilidadIA =
  | 'apagada'
  | 'disponible'
  | 'idioma-no-soportado'
  | 'no-compatible'
  | 'no-lista'
  | 'sin-modulo'
  | 'sistema-antiguo';

interface ModuloAndenIA {
  disponibilidad(): Promise<DisponibilidadIA>;
  responder(instrucciones: string, pregunta: string): Promise<string>;
}

/** el módulo nativo; nulo donde no existe (Android, web, pruebas) */
const modulo = requireOptionalNativeModule<ModuloAndenIA>('AndenIA');

export async function disponibilidadDelModelo(): Promise<DisponibilidadIA> {
  if (!modulo) return 'sin-modulo';
  try {
    return await modulo.disponibilidad();
  } catch {
    return 'no-compatible';
  }
}

export async function responderConElModelo(
  instrucciones: string,
  pregunta: string,
): Promise<string> {
  if (!modulo) throw new Error('sin-modulo');
  return modulo.responder(instrucciones, pregunta);
}
