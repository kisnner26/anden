import type { NombreIcono } from '@/componentes/Icono';

/** lo que incluye Andén Plus; cada uno se engancha a `esPlus` en el lugar donde se aplica */
export type Beneficio =
  | 'abordajePrioritario'
  | 'avisosPersonalizados'
  | 'busPropio'
  | 'busquedasAmpliadas'
  | 'habitualesIlimitados'
  | 'insigniaPlus'
  | 'reservaAnticipada'
  | 'resumenViajes'
  | 'rumboConIA'
  | 'transferenciasIlimitadas';

export interface DescripcionBeneficio {
  icono: NombreIcono;
  id: Beneficio;
}

export const BENEFICIOS_PLUS: readonly DescripcionBeneficio[] = [
  { icono: 'campana', id: 'avisosPersonalizados' },
  { icono: 'estrella', id: 'habitualesIlimitados' },
  { icono: 'reloj', id: 'resumenViajes' },
  { icono: 'volante', id: 'busPropio' },
  { icono: 'lupa', id: 'busquedasAmpliadas' },
  { icono: 'rayo', id: 'insigniaPlus' },
  { icono: 'reloj', id: 'reservaAnticipada' },
  { icono: 'confirmar', id: 'abordajePrioritario' },
  { icono: 'boleto', id: 'transferenciasIlimitadas' },
  { icono: 'estrella', id: 'rumboConIA' },
];

/** cuántos boletos se pueden pasar a otra persona por día sin Plus */
export const TRANSFERENCIAS_GRATIS_POR_DIA = 1;

export function puedeTransferir(plus: boolean, hechasHoy: number): boolean {
  return plus || hechasHoy < TRANSFERENCIAS_GRATIS_POR_DIA;
}

/** Rumbo afina su ayuda con la IA del teléfono solo para quien tiene Plus; los demás reciben la ayuda escrita */
export function rumboUsaIA(plus: boolean): boolean {
  return plus;
}

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

/** búsquedas recientes que se recuerdan: más con Plus */
export const RECIENTES_GRATIS = 5;
export const RECIENTES_PLUS = 15;

export function limiteDeRecientes(plus: boolean): number {
  return plus ? RECIENTES_PLUS : RECIENTES_GRATIS;
}

/** cuántos días por delante se puede reservar: Plus reserva con más anticipación que el resto */
export const DIAS_RESERVA_GRATIS = 3;
export const DIAS_RESERVA_PLUS = 14;

export function diasDeAnticipacion(plus: boolean): number {
  return plus ? DIAS_RESERVA_PLUS : DIAS_RESERVA_GRATIS;
}

/** si una salida cae dentro de lo que esta persona puede reservar ya */
export function puedeReservarSalida(
  plus: boolean,
  salida: Date,
  ahora: Date,
): boolean {
  const inicioHoy = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate(),
  );
  const limite = new Date(inicioHoy);
  limite.setDate(limite.getDate() + diasDeAnticipacion(plus));
  return salida.getTime() < limite.getTime();
}
