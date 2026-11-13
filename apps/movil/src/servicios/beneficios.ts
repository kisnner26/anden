import type { NombreIcono } from '@/componentes/Icono';

/** lo que incluye Andén Plus; cada uno se engancha a `esPlus` en el lugar donde se aplica */
export type Beneficio =
  | 'avisosPersonalizados'
  | 'busPropio'
  | 'habitualesIlimitados'
  | 'resumenViajes';

export interface DescripcionBeneficio {
  icono: NombreIcono;
  id: Beneficio;
}

export const BENEFICIOS_PLUS: readonly DescripcionBeneficio[] = [
  { icono: 'campana', id: 'avisosPersonalizados' },
  { icono: 'estrella', id: 'habitualesIlimitados' },
  { icono: 'reloj', id: 'resumenViajes' },
  { icono: 'volante', id: 'busPropio' },
];

/** cuántos viajes habituales se pueden guardar sin Plus */
export const HABITUALES_GRATIS = 1;

/** el único aviso que se puede pedir sin Plus: 30 minutos antes */
export const AVISO_GRATIS_MINUTOS = 30;

export function puedeGuardarHabitual(
  plus: boolean,
  guardados: number,
): boolean {
  return plus || guardados < HABITUALES_GRATIS;
}

export function avisoDisponible(plus: boolean, minutosAntes: number): boolean {
  return plus || minutosAntes === AVISO_GRATIS_MINUTOS;
}
