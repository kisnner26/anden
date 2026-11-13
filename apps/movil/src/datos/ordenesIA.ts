import { digitosTelefonoNi } from '@anden/dominio';

import type { Salida } from './salidas';

/** lo que la persona le pide hacer a Andén dentro de la app, en vez de solo preguntarle */
export type Orden =
  | { destino: string; origen: string | null; tipo: 'reservar' }
  | { destino: string; origen: string | null; tipo: 'viaje' }
  | { nombre: string; tipo: 'contacto' };

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** la ciudad que aparece en el texto, de las que existen en la app; nula si no hay ninguna */
function ciudadEn(texto: string, ciudades: readonly string[]): string | null {
  const buscado = sinTildes(texto);
  return ciudades.find((ciudad) => buscado.includes(sinTildes(ciudad))) ?? null;
}

const VERBOS_RESERVA = /\b(compr\w*|reserv\w*|sac\w*|apart\w*)\b/;
const OBJETOS_RESERVA =
  /\b(boleto|boletos|pasaje|pasajes|asiento|ticket|tiquete)\b/;
const VERBOS_VER =
  /\b(mostr\w*|muestr\w*|ver|vea|busc\w*|dime|dec\w*|cual|cuando|cuales|que)\b/;
const OBJETOS_VIAJE =
  /\b(viaje|bus|buses|salida|salidas|interlocal|microbus)\b/;

/**
 * entiende una orden corta y clara: agregar un contacto, mostrar el próximo viaje o reservar un
 * boleto. Lo que no es una orden devuelve nulo y se le pregunta al modelo como siempre.
 */
export function interpretarOrden(
  texto: string,
  ciudades: readonly string[],
): Orden | null {
  const limpio = texto.trim();
  const normal = sinTildes(limpio);
  if (normal === '') return null;

  const contacto =
    /(?:agrega\w*|anade\w*|pon\w*|guarda\w*|registra\w*)\s+(?:a\s+)?(.+?)\s+como\s+(?:mi\s+)?(?:contacto|persona)/.exec(
      normal,
    );
  if (contacto?.[1]) {
    // el nombre se toma del texto original para no perder tildes ni mayúsculas
    const inicio = normal.indexOf(contacto[1]);
    const nombre = limpio.slice(inicio, inicio + contacto[1].length).trim();
    if (nombre.length >= 2) return { nombre, tipo: 'contacto' };
  }

  const destino = ciudadEn(
    normal.includes(' desde ')
      ? (normal.split(' desde ')[0] ?? normal)
      : normal,
    ciudades,
  );
  if (!destino) return null;
  const desdeTexto = normal.includes(' desde ')
    ? normal.split(' desde ')[1]
    : '';
  const origen = desdeTexto ? ciudadEn(desdeTexto, ciudades) : null;

  if (VERBOS_RESERVA.test(normal) && OBJETOS_RESERVA.test(normal)) {
    return { destino, origen, tipo: 'reservar' };
  }
  if (
    VERBOS_VER.test(normal) &&
    OBJETOS_VIAJE.test(normal) &&
    /\b(proxim\w*|siguiente|primer\w*|mas pronto|ahorita)\b/.test(normal)
  ) {
    return { destino, origen, tipo: 'viaje' };
  }
  return null;
}

/** el teléfono de Nicaragua que dijo la persona, aunque lo dicte con espacios o guiones; nulo si no hay */
export function telefonoDictado(texto: string): string | null {
  const digitos = texto.replace(/\D/g, '');
  return digitosTelefonoNi(digitos);
}

/** la próxima salida que todavía no parte hacia un destino, con asientos y venta abierta */
export function proximaSalidaA(
  salidas: readonly Salida[],
  destino: string,
  origen: string | null,
  ahora: Date,
): Salida | null {
  return (
    salidas
      .filter(
        (salida) =>
          salida.destino === destino &&
          (origen === null || salida.origen === origen) &&
          salida.salida.getTime() >= ahora.getTime() - 5 * 60_000 &&
          salida.ventaAbierta &&
          salida.asientosLibres > 0,
      )
      .sort((a, b) => a.salida.getTime() - b.salida.getTime())[0] ?? null
  );
}
