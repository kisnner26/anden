import type { BoletoGuardado } from './reserva';

/** lo que dice el QR de un boleto: `ANDEN:` y el código de ocho caracteres */
const PREFIJO = 'ANDEN:';

/** el código que lleva un QR leído, sin espacios y en mayúsculas; nulo si no es un boleto de Andén */
export function codigoDeQR(texto: string): string | null {
  const limpio = texto.trim().toUpperCase();
  if (!limpio.startsWith(PREFIJO)) return null;
  const codigo = limpio.slice(PREFIJO.length).replace(/[\s-]/g, '');
  return /^[A-Z0-9]{8}$/.test(codigo) ? codigo : null;
}

export type ResultadoDeLectura =
  | { tipo: 'invalido' }
  | { tipo: 'otroViaje' }
  | { asiento: number; boletoId: string; nombre: string; tipo: 'ya' }
  | { asiento: number; boletoId: string; nombre: string; tipo: 'ok' };

/**
 * qué pasa al leer un QR en la puerta del bus: un boleto de este viaje deja subir a su dueño (y avisa si ya había
 * subido), uno de otro viaje o cancelado no, y un código que no es de Andén es inválido
 */
export function resultadoDeLectura(
  texto: string,
  boletos: readonly BoletoGuardado[],
  viajeId: string,
  yaSubio: (boletoId: string) => boolean,
): ResultadoDeLectura {
  const codigo = codigoDeQR(texto);
  if (!codigo) return { tipo: 'invalido' };
  const encontrado = boletos.find((b) => b.boleto.codigo === codigo);
  if (!encontrado || encontrado.boleto.estado === 'cancelado') {
    return { tipo: 'invalido' };
  }
  if (encontrado.boleto.viajeId !== viajeId) return { tipo: 'otroViaje' };
  const datos = {
    asiento: encontrado.boleto.asiento,
    boletoId: encontrado.boleto.id,
    nombre: encontrado.boleto.pasajero.nombre,
  };
  return yaSubio(encontrado.boleto.id)
    ? { ...datos, tipo: 'ya' }
    : { ...datos, tipo: 'ok' };
}
