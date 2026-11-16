import { cobradoPorDia, rankingDeConductores, resumir } from './analitica';
import { dinero } from './formato';
import type { Datos } from '../tipos';

/** dónde corre el puente de Claude Code: por defecto, esta misma Mac */
export const DIRECCION_POR_DEFECTO = 'http://127.0.0.1:4780';

export interface ConexionClaude {
  codigo: string;
  direccion: string;
}

/** la dirección del puente sin barra final; nulo si no es http o https con equipo y puerto */
export function direccionDelPuente(texto: string): string | null {
  try {
    const url = new URL(texto.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.pathname !== '/' || url.search !== '' || url.hash !== '')
      return null;
    if (url.port === '') return null;
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

/** el código de emparejamiento son 48 caracteres hexadecimales */
export function codigoDelPuente(texto: string): string | null {
  const limpio = texto.trim().toLowerCase();
  return /^[0-9a-f]{48}$/.test(limpio) ? limpio : null;
}
