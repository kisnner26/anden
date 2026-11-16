import { FICHAS, fichaDeCiudad } from './fichasCiudad';
import { OPCIONES_MINUTOS, type MinutosAntes } from './recordatorios';
import type { PantallaAbrible } from './ordenesIA';

/**
 * lo que el asistente puede hacer por la persona, además de contestar. El modelo solo elige la acción:
 * el texto de los mensajes lo arma la app, y todo lo que sale del teléfono pasa por Mensajes o por la
 * hoja de compartir, donde la persona lo revisa y lo envía.
 */
export type AccionIA =
  | { minutos: MinutosAntes; tipo: 'avisar' }
  | { pantalla: PantallaAbrible; tipo: 'abrir' }
  | { ciudad: string; tipo: 'postal' }
  | { tipo: 'compartir' };

const PANTALLAS: readonly PantallaAbrible[] = [
  'ajustes',
  'avisos',
  'boletos',
  'encomienda',
  'horarios',
  'plus',
  'rutas',
];

/** el aviso más cercano a lo pedido entre los que la app sabe programar; 30 si no dijo nada claro */
export function minutosValidos(pedido: unknown): MinutosAntes {
  if (typeof pedido !== 'number' || !Number.isFinite(pedido) || pedido <= 0) {
    return 30;
  }
  return OPCIONES_MINUTOS.reduce((mejor, opcion) =>
    Math.abs(opcion - pedido) < Math.abs(mejor - pedido) ? opcion : mejor,
  );
}

/** deja solo las acciones que la app conoce, con valores válidos; lo demás que escriba el modelo se ignora */
export function leerAcciones(valor: unknown): AccionIA[] {
  if (!Array.isArray(valor)) return [];
  const acciones: AccionIA[] = [];
  for (const crudo of valor) {
    if (typeof crudo !== 'object' || crudo === null) continue;
    const { ciudad, minutos, pantalla, tipo } = crudo as Record<
      string,
      unknown
    >;
    let accion: AccionIA | null = null;
    if (tipo === 'avisar') accion = { minutos: minutosValidos(minutos), tipo };
    else if (tipo === 'compartir') accion = { tipo };
    else if (tipo === 'postal') {
      const ficha = typeof ciudad === 'string' ? fichaDeCiudad(ciudad) : null;
      if (ficha) accion = { ciudad: ficha.ciudad, tipo };
    } else if (
      tipo === 'abrir' &&
      typeof pantalla === 'string' &&
      PANTALLAS.includes(pantalla as PantallaAbrible)
    ) {
      accion = { pantalla: pantalla as PantallaAbrible, tipo };
    }
    if (!accion) continue;
    const repetida = acciones.some(
      (previa) => JSON.stringify(previa) === JSON.stringify(accion),
    );
    if (!repetida) acciones.push(accion);
  }
  return acciones.slice(0, 2);
}

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** "avisame 30 minutos antes", "compartí mi viaje": las órdenes que no necesitan al modelo, en cualquier teléfono */
export function accionDeOrden(texto: string): AccionIA | null {
  const normal = sinTildes(texto);
  const aviso =
    /\b(avis\w*|record\w*|alert\w*|notific\w*)\b/.test(normal) &&
    /\b(antes|minutos?|hora)\b/.test(normal) &&
    /\b(bus|viaje|salga|salir|salida|boleto)\b/.test(normal);
  if (aviso) {
    const numero = /(\d{1,3})\s*(?:min|minutos)/.exec(normal)?.[1];
    const hora = /\b(una hora|1 hora)\b/.test(normal) ? 60 : undefined;
    return {
      minutos: minutosValidos(numero ? Number(numero) : hora),
      tipo: 'avisar',
    };
  }
  const postal =
    /\b(postal|ilustracion|imagen|dibujo|foto)\b/.test(normal) &&
    /\b(hac\w*|cre\w*|gener\w*|dibuj\w*|arm\w*|quiero|dame)\b/.test(normal);
  if (postal) {
    const ficha = FICHAS.find((f) => normal.includes(sinTildes(f.ciudad)));
    if (ficha) return { ciudad: ficha.ciudad, tipo: 'postal' };
  }
  const comparte =
    /\b(compart\w*|mand\w*|envi\w*|avis\w*|pas\w*)\b/.test(normal) &&
    /\b(mi viaje|mi ruta|donde voy|que voy en|mi contacto|mi familia|mi mama|mi papa|mi esposa|mi esposo)\b/.test(
      normal,
    );
  return comparte ? { tipo: 'compartir' } : null;
}
