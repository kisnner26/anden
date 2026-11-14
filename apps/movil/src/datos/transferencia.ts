import type { BoletoGuardado } from './reserva';

/** las letras y números que usa el código: sin 0, O, 1, I ni L para que no se confundan al dictarlo */
export const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const LARGO_CODIGO = 8;

/** minutos que vale una oferta de transferencia */
export const MINUTOS_DE_OFERTA = 30;

/** deja solo las letras y números válidos, en mayúscula: acepta que lo escriban con espacios, guiones o en minúscula */
export function normalizarCodigo(texto: string): string {
  return texto
    .toUpperCase()
    .split('')
    .filter((signo) => ALFABETO_CODIGO.includes(signo))
    .join('')
    .slice(0, LARGO_CODIGO);
}

export function codigoCompleto(texto: string): boolean {
  return normalizarCodigo(texto).length === LARGO_CODIGO;
}

/** el código en dos grupos para leerlo y dictarlo: ABCD-2345 */
export function codigoLegible(codigo: string): string {
  const limpio = normalizarCodigo(codigo);
  return limpio.length > 4
    ? `${limpio.slice(0, 4)}-${limpio.slice(4)}`
    : limpio;
}

/** el enlace que abre Andén en la pantalla de recibir, con el código ya escrito */
export function enlaceDeTransferencia(codigo: string): string {
  return `anden://recibir?codigo=${normalizarCodigo(codigo)}`;
}

export interface DatosMensajeTransferencia {
  codigo: string;
  destino: string;
  /** hora de salida ya escrita, por ejemplo 3:30 p. m. */
  salida: string;
}

/** el mensaje que se comparte por AirDrop, Quick Share o mensajes: el viaje, el código y el enlace; sin datos personales */
export function mensajeDeTransferencia(
  datos: DatosMensajeTransferencia,
): string {
  return `Te paso mi boleto a ${datos.destino}, sale a las ${datos.salida}.\nCódigo: ${codigoLegible(datos.codigo)} (vale ${MINUTOS_DE_OFERTA} minutos)\nAbrilo en Andén: ${enlaceDeTransferencia(datos.codigo)}`;
}

export type ErrorReclamo =
  'conexion' | 'no-existe' | 'propia' | 'ya-usada' | 'vencida';

export type EstadoOferta =
  'cancelada' | 'inexistente' | 'pendiente' | 'reclamada' | 'vencida';

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

/** lee lo que respondió el servidor al canjear: el boleto, o el motivo por el que no se pudo */
export function leerRespuestaDeReclamo(
  valor: unknown,
): { boleto: BoletoGuardado } | { error: ErrorReclamo } {
  if (!esObjeto(valor)) return { error: 'conexion' };
  const error = valor.error;
  if (
    error === 'no-existe' ||
    error === 'propia' ||
    error === 'ya-usada' ||
    error === 'vencida'
  ) {
    return { error };
  }
  const boleto = valor.boleto;
  if (
    esObjeto(boleto) &&
    esObjeto(boleto.boleto) &&
    esObjeto(boleto.resumen) &&
    typeof boleto.boleto.id === 'string'
  ) {
    return { boleto: boleto as unknown as BoletoGuardado };
  }
  return { error: 'conexion' };
}

export interface OfertaVista {
  estado: EstadoOferta;
  /** el primer nombre de quien lo recibió, cuando ya lo recibieron */
  paraNombre: string;
}

/** lee el estado de la oferta que devuelve el servidor */
export function leerEstadoDeOferta(valor: unknown): OfertaVista | null {
  if (!esObjeto(valor)) return null;
  const estado = valor.estado;
  if (
    estado !== 'cancelada' &&
    estado !== 'inexistente' &&
    estado !== 'pendiente' &&
    estado !== 'reclamada' &&
    estado !== 'vencida'
  ) {
    return null;
  }
  return {
    estado,
    paraNombre: typeof valor.para_nombre === 'string' ? valor.para_nombre : '',
  };
}
