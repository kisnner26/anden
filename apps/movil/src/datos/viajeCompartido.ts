import { enlaceDeViaje } from './contactoConfianza';

/** el código largo que arma el servidor: 32 letras y números, sin guiones */
export function tokenValido(token: unknown): token is string {
  return typeof token === 'string' && /^[0-9a-f]{32}$/.test(token);
}

/** la dirección de la página donde se sigue el viaje; sin página configurada no hay enlace web */
export function enlaceDeSeguimiento(
  base: string | null | undefined,
  token: string,
): string | null {
  const limpia = base?.trim().replace(/\/+$/, '');
  if (!limpia || !/^https:\/\//.test(limpia) || !tokenValido(token))
    return null;
  return `${limpia}/?t=${token}`;
}

export interface DatosMensajeCompartido {
  destino: string;
  /** el enlace web de seguimiento; si falta se usa el que abre la app */
  enlaceWeb: string | null;
  placa: string;
  /** hora de salida ya escrita, por ejemplo 1:45 p. m. */
  salida: string;
  viajeId: string;
}

/** el mensaje que se comparte: a dónde va, cuándo sale, el bus y el enlace para seguirlo en vivo */
export function mensajeDeSeguimiento(datos: DatosMensajeCompartido): string {
  const enlace = datos.enlaceWeb ?? enlaceDeViaje(datos.viajeId);
  const seguimiento = datos.enlaceWeb
    ? 'Podés ver por dónde va el bus en vivo, sin instalar nada'
    : 'Seguí el viaje en Andén';
  return `Voy en el bus a ${datos.destino}. Sale a las ${datos.salida}, placa ${datos.placa}.\n${seguimiento}: ${enlace}`;
}
