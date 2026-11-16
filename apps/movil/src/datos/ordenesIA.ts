import { digitosTelefonoNi } from '@anden/dominio';

import { accionDeOrden, type AccionIA } from './accionesIA';
import { mismoDia, sumarDias } from './dias';
import type { GustosDeViaje } from './gustosDeViaje';
import { mejorSalida } from './mejorSalida';
import type { Salida } from './salidas';

/** lo que la persona le pide hacer a Andén dentro de la app, en vez de solo preguntarle */
export type PantallaAbrible =
  | 'ajustes'
  | 'avisos'
  | 'boletos'
  | 'encomienda'
  | 'horarios'
  | 'plus'
  | 'rutas';

/** cuándo quiere viajar: un día, una parte del día o una hora; lo que no dijo queda nulo */
export interface CuandoPedido {
  dia: Date | null;
  /** hora exacta pedida, de 0 a 23 */
  hora: number | null;
  /** parte del día: de madrugada, temprano, por la mañana, por la tarde o por la noche */
  franja: 'madrugada' | 'manana' | 'noche' | 'tarde' | 'temprano' | null;
}

export type Orden =
  | { accion: AccionIA; tipo: 'accion' }
  | { pantalla: PantallaAbrible; tipo: 'abrir' }
  | {
      cuando?: CuandoPedido;
      destino: string;
      origen: string | null;
      tipo: 'reservar';
    }
  | {
      cuando?: CuandoPedido;
      destino: string;
      origen: string | null;
      tipo: 'viaje';
    }
  | { nombre: string; tipo: 'contacto' };

/** las horas de salida que cubre cada parte del día, de la inicial (incluida) a la final (excluida) */
const RANGOS: Record<NonNullable<CuandoPedido['franja']>, [number, number]> = {
  madrugada: [0, 6],
  manana: [6, 12],
  noche: [18, 24],
  tarde: [12, 18],
  temprano: [3, 9],
};

const DIAS_SEMANA: [RegExp, number][] = [
  [/\bdomingo\b/, 0],
  [/\blunes\b/, 1],
  [/\bmartes\b/, 2],
  [/\bmiercoles\b/, 3],
  [/\bjueves\b/, 4],
  [/\bviernes\b/, 5],
  [/\bsabado\b/, 6],
];

/** "mañana temprano", "el viernes a las 6", "esta noche": lo que la orden dice sobre cuándo; nulo si no dice nada */
export function entenderCuando(
  texto: string,
  ahora: Date,
): CuandoPedido | null {
  const normal = sinTildes(texto);
  let dia: Date | null = null;
  if (/\bpasado manana\b/.test(normal)) dia = sumarDias(ahora, 2);
  else if (/\b(por la|en la|de la|esta) manana\b/.test(normal)) dia = ahora;
  else if (/\bmanana\b/.test(normal)) dia = sumarDias(ahora, 1);
  else if (/\b(hoy|esta tarde|esta noche|ahorita)\b/.test(normal)) dia = ahora;
  else {
    for (const [patron, numero] of DIAS_SEMANA) {
      if (patron.test(normal)) {
        dia = sumarDias(ahora, (numero - ahora.getDay() + 7) % 7 || 7);
        break;
      }
    }
  }

  let franja: CuandoPedido['franja'] = null;
  if (/\bmadrugada\b/.test(normal)) franja = 'madrugada';
  else if (/\btemprano\b/.test(normal)) franja = 'temprano';
  else if (/\b(por la|en la|de la|esta) manana\b/.test(normal))
    franja = 'manana';
  else if (/\b(tarde)\b/.test(normal)) franja = 'tarde';
  else if (/\b(noche)\b/.test(normal)) franja = 'noche';

  let hora: number | null = null;
  const exacta =
    /\ba las (\d{1,2})(?::\d{2})?\s*(am|pm|de la manana|de la tarde|de la noche)?/.exec(
      normal,
    );
  if (exacta?.[1]) {
    let h = Number(exacta[1]);
    const marca = exacta[2] ?? '';
    if (
      (marca === 'pm' || marca.includes('tarde') || marca.includes('noche')) &&
      h < 12
    )
      h += 12;
    if (h >= 0 && h <= 23) hora = h;
  }

  return dia || franja || hora !== null ? { dia, franja, hora } : null;
}

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
const PIDE_PRECIO = /\b(cuanto|precio|tarifa|cuesta|vale|costo)\b/;
const OBJETOS_VIAJE =
  /\b(viaje|bus|buses|salida|salidas|interlocal|microbus)\b/;

/**
 * entiende una orden corta y clara: agregar un contacto, mostrar el próximo viaje o reservar un
 * boleto. Lo que no es una orden devuelve nulo y se le pregunta al modelo como siempre.
 */
export function interpretarOrden(
  texto: string,
  ciudades: readonly string[],
  ahora: Date = new Date(),
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

  // "abrime mis boletos", "enviar una encomienda": llevan a una pantalla de la app
  if (/\b(envi\w*|mand\w*|despach\w*)\b.*\bencomienda\w*\b/.test(normal)) {
    return { pantalla: 'encomienda', tipo: 'abrir' };
  }
  const abrir =
    /\b(abr\w*|llev\w*|ir|ver|mostr\w*|muestr\w*)\b.*\b(boletos?|encomiendas?|avisos|ajustes|horarios|rutas|plus)\b/.exec(
      normal,
    );
  if (abrir?.[2] && !VERBOS_RESERVA.test(normal)) {
    const clave = abrir[2];
    const pantalla: PantallaAbrible = clave.startsWith('boleto')
      ? 'boletos'
      : clave.startsWith('encomienda')
        ? 'encomienda'
        : (clave as PantallaAbrible);
    return { pantalla, tipo: 'abrir' };
  }

  const accion = accionDeOrden(limpio);
  if (accion) return { accion, tipo: 'accion' };

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

  const cuando = entenderCuando(normal, ahora);
  // "un asiento a Boaco mañana temprano" ya es un pedido, aunque no diga "reservame"; una pregunta o un precio no lo es
  const pedidoDirecto =
    OBJETOS_RESERVA.test(normal) &&
    !VERBOS_VER.test(normal) &&
    !PIDE_PRECIO.test(normal) &&
    !limpio.includes('?');
  if (
    (VERBOS_RESERVA.test(normal) && OBJETOS_RESERVA.test(normal)) ||
    pedidoDirecto
  ) {
    return { ...(cuando ? { cuando } : {}), destino, origen, tipo: 'reservar' };
  }
  if (
    VERBOS_VER.test(normal) &&
    OBJETOS_VIAJE.test(normal) &&
    /\b(proxim\w*|siguiente|primer\w*|mas pronto|ahorita)\b/.test(normal)
  ) {
    return { ...(cuando ? { cuando } : {}), destino, origen, tipo: 'viaje' };
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
  cuando?: CuandoPedido,
  /** si se pasan los gustos (aunque vacíos), no se toma la más próxima sino la que más le conviene */
  gustos?: GustosDeViaje,
): Salida | null {
  const rango = cuando?.franja ? RANGOS[cuando.franja] : null;
  const candidatas = salidas.filter(
    (salida) =>
      salida.destino === destino &&
      (origen === null || salida.origen === origen) &&
      salida.salida.getTime() >= ahora.getTime() - 5 * 60_000 &&
      salida.ventaAbierta &&
      salida.asientosLibres > 0 &&
      (!cuando?.dia || mismoDia(salida.salida, cuando.dia)) &&
      (!rango ||
        (salida.salida.getHours() >= rango[0] &&
          salida.salida.getHours() < rango[1])),
  );
  if (cuando?.hora !== undefined && cuando.hora !== null) {
    const hora = cuando.hora;
    // con una hora exacta gana la salida más cercana a ella
    const distancia = (s: Salida) =>
      Math.abs(s.salida.getHours() + s.salida.getMinutes() / 60 - hora);
    return (
      [...candidatas].sort(
        (a, b) =>
          distancia(a) - distancia(b) ||
          a.salida.getTime() - b.salida.getTime(),
      )[0] ?? null
    );
  }
  const elegida =
    gustos === undefined
      ? null
      : mejorSalida(candidatas, { ahora, cuando: cuando ?? null, gustos });
  return (
    elegida?.salida ??
    candidatas.sort((a, b) => a.salida.getTime() - b.salida.getTime())[0] ??
    null
  );
}
