/**
 * Fichas de las ciudades de la red. Solo datos que se pueden confirmar; el asistente no agrega lugares
 * que no estén aquí. Para sumar una ciudad se agrega su ficha y su foto en `fotosDestino.ts`.
 */
export interface FichaCiudad {
  ciudad: string;
  /** una frase que dice qué es la ciudad */
  resumen: string;
  /** lugares o rasgos que vale la pena conocer */
  lugares: string[];
}

export const FICHAS: readonly FichaCiudad[] = [
  {
    ciudad: 'Managua',
    lugares: [
      'Puerto Salvador Allende, el malecón a orillas del lago Xolotlán',
      'Catedral Metropolitana de la Inmaculada Concepción, inaugurada en 1993',
      'Loma de Tiscapa, con vista a la laguna y a la ciudad',
    ],
    resumen:
      'Capital de Nicaragua, a orillas del lago Xolotlán (lago de Managua).',
  },
  {
    ciudad: 'Boaco',
    lugares: [
      'Su centro histórico y la iglesia de la ciudad',
      'Los quesos y lácteos de la zona ganadera',
    ],
    resumen:
      'Cabecera del departamento de Boaco, conocida como la ciudad de dos pisos por sus partes alta y baja; zona ganadera y de quesos.',
  },
  {
    ciudad: 'Juigalpa',
    lugares: [
      'Museo Arqueológico Gregorio Aguilar Barea, con estatuaria precolombina de la región',
      'Su parque central y la iglesia',
      'La cultura ganadera de Chontales',
    ],
    resumen:
      'Cabecera del departamento de Chontales, centro de una región ganadera.',
  },
];

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

export function fichaDeCiudad(ciudad: string): FichaCiudad | null {
  const buscada = sinTildes(ciudad);
  return FICHAS.find((ficha) => sinTildes(ficha.ciudad) === buscada) ?? null;
}

/** la ficha en una línea, para que la consulte el modelo */
export function textoDeFicha(ficha: FichaCiudad): string {
  return `${ficha.ciudad}: ${ficha.resumen} Para visitar: ${ficha.lugares.join('; ')}.`;
}
