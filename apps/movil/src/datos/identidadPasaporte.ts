import type { BoletoGuardado } from './reserva';

export type NivelDelPasaporte =
  'aspirante' | 'pasajero' | 'frecuente' | 'viajero' | 'trotamundos';

/** desde cuántos viajes hechos se tiene cada nivel, de menor a mayor */
export const NIVELES: readonly { desde: number; id: NivelDelPasaporte }[] = [
  { desde: 0, id: 'aspirante' },
  { desde: 1, id: 'pasajero' },
  { desde: 5, id: 'frecuente' },
  { desde: 10, id: 'viajero' },
  { desde: 25, id: 'trotamundos' },
];

export interface AvanceDeNivel {
  nivel: NivelDelPasaporte;
  /** el nivel que sigue y cuántos viajes faltan; nulo en el más alto */
  siguiente: { faltan: number; id: NivelDelPasaporte } | null;
  /** de 0 a 1: lo recorrido entre este nivel y el siguiente; 1 en el más alto */
  progreso: number;
}

/** el nivel según los viajes hechos y lo que falta para el siguiente */
export function nivelDelPasaporte(viajes: number): AvanceDeNivel {
  let indice = 0;
  NIVELES.forEach((nivel, i) => {
    if (viajes >= nivel.desde) indice = i;
  });
  const actual = NIVELES[indice]!;
  const proximo = NIVELES[indice + 1];
  if (!proximo) return { nivel: actual.id, progreso: 1, siguiente: null };
  return {
    nivel: actual.id,
    progreso: (viajes - actual.desde) / (proximo.desde - actual.desde),
    siguiente: { faltan: proximo.desde - viajes, id: proximo.id },
  };
}

/** una suma simple de los caracteres, repetible: el mismo texto siempre da el mismo número */
function huella(texto: string): number {
  let valor = 7;
  for (const caracter of texto) {
    valor = (valor * 31 + caracter.charCodeAt(0)) % 10_000_000;
  }
  return valor;
}

/** el número del pasaporte, como AN-0123456: sale del nombre, así que no cambia con los viajes */
export function numeroDePasaporte(nombre: string, apellido: string): string {
  const base = `${nombre.trim()}|${apellido.trim()}`.toLowerCase();
  return `AN${String(huella(base)).padStart(7, '0')}`;
}

const ANCHO_MRZ = 44;

/** letras sin tildes ni signos, en mayúsculas, con los espacios convertidos en < como en un pasaporte real */
function enZonaDeLectura(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '<')
    .replace(/^<+|<+$/g, '');
}

function rellenar(texto: string): string {
  return texto.slice(0, ANCHO_MRZ).padEnd(ANCHO_MRZ, '<');
}

/**
 * las dos líneas de máquina que cierran la página de datos, de 44 signos cada una: país y nombre, y número con
 * los viajes hechos; es adorno, pero con el formato de verdad
 */
export function lineasDeLectura(
  nombre: string,
  apellido: string,
  numero: string,
  viajes: number,
): [string, string] {
  const personas =
    `${enZonaDeLectura(apellido)}<<${enZonaDeLectura(nombre)}`.replace(
      /^<<|<<$/g,
      '',
    ) || 'VIAJERO';
  return [
    rellenar(`P<NIC${personas}`),
    rellenar(`${numero}<NIC<${String(Math.min(viajes, 999)).padStart(3, '0')}`),
  ];
}

/** cuándo empezó a viajar: la salida del primer boleto no cancelado; nulo si todavía no hay */
export function primerViaje(boletos: readonly BoletoGuardado[]): string | null {
  const fechas = boletos
    .filter((b) => b.boleto.estado !== 'cancelado')
    .map((b) => b.resumen.salida)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return fechas[0] ?? null;
}
