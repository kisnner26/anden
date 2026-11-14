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

interface SuscripcionIA {
  remove(): void;
}

interface ModuloAndenIA {
  addListener(
    evento: 'onHerramienta' | 'onParcial',
    alRecibir: (datos: Record<string, string>) => void,
  ): SuscripcionIA;
  conversar?(
    conversacion: string,
    peticion: string,
    instrucciones: string,
    datosJson: string,
    pregunta: string,
  ): Promise<string>;
  disponibilidad(): Promise<DisponibilidadIA>;
  olvidar?(conversacion: string): Promise<boolean>;
  precalentar?(conversacion: string, instrucciones: string): Promise<boolean>;
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

/** si el módulo instalado sabe conversar con herramientas (iOS con Foundation Models) */
export const sabeConversar = modulo?.conversar !== undefined;

export interface PedidoConversacion {
  alHerramienta?: (herramienta: string) => void;
  /** el JSON de lo que lleva escrito el modelo, cada vez que avanza */
  alParcial?: (json: string) => void;
  conversacion: string;
  datosJson: string;
  instrucciones: string;
  pregunta: string;
}

let contadorPeticiones = 0;

/** conversa con herramientas y respuesta estructurada; devuelve el JSON final */
export async function conversarConElModelo({
  alHerramienta,
  alParcial,
  conversacion,
  datosJson,
  instrucciones,
  pregunta,
}: PedidoConversacion): Promise<string> {
  if (!modulo?.conversar) throw new Error('sin-modulo');
  contadorPeticiones += 1;
  const peticion = `p${contadorPeticiones}`;
  const suscripciones = [
    modulo.addListener('onParcial', (datos) => {
      if (datos.id === peticion && datos.json) alParcial?.(datos.json);
    }),
    modulo.addListener('onHerramienta', (datos) => {
      if (datos.id === peticion && datos.herramienta) {
        alHerramienta?.(datos.herramienta);
      }
    }),
  ];
  try {
    return await modulo.conversar(
      conversacion,
      peticion,
      instrucciones,
      datosJson,
      pregunta,
    );
  } finally {
    for (const suscripcion of suscripciones) suscripcion.remove();
  }
}

export async function precalentarModelo(
  conversacion: string,
  instrucciones: string,
): Promise<void> {
  try {
    await modulo?.precalentar?.(conversacion, instrucciones);
  } catch {
    // calentar es una ayuda: si falla, la primera respuesta solo tarda un poco más
  }
}

export async function olvidarConversacion(conversacion: string): Promise<void> {
  try {
    await modulo?.olvidar?.(conversacion);
  } catch {
    // sin sesión nativa no hay nada que olvidar
  }
}
