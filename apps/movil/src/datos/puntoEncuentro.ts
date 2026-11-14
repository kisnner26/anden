import { enlaceDeMapa } from '@anden/dominio';
import { Linking } from 'react-native';

import { t } from '@/textos/t';

/** los últimos siete signos del Plus Code, como 4PPX+HC: caben en una fila y ubican el punto en unos 14 km */
export function puntoCorto(codigo: string): string {
  return codigo.slice(4);
}

/** "punto 4PPX+HC", o "punto por confirmar" mientras el conductor no lo puso */
export function etiquetaPunto(codigo: string): string {
  return codigo === ''
    ? t('punto.porConfirmar')
    : `${t('punto.etiqueta')} ${puntoCorto(codigo)}`;
}

/** abre el punto en la app de mapas; falso si no hay código o el teléfono no pudo abrirlo */
export async function abrirPuntoEnMapa(codigo: string): Promise<boolean> {
  const enlace = enlaceDeMapa(codigo);
  if (enlace === null) return false;
  try {
    await Linking.openURL(enlace);
    return true;
  } catch {
    return false;
  }
}
