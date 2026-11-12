/** geometría de cada silueta de bus sobre un lienzo de 520 por 300 */
export interface Ventana {
  alto: number;
  rx: number;
  x: number;
  y: number;
  ancho: number;
}

export interface Forma {
  /** desplazamiento horizontal para centrar la silueta en el lienzo */
  dx: number;
  carroceria: string;
  /** altura y grosor de la banda de color */
  banda: { alto: number; y: number };
  /** parabrisas */
  frente: string;
  /** vidrios de los costados */
  ventanas: readonly Ventana[];
  /** cuadro del letrero del destino: x, y, ancho, alto */
  letrero: { alto: number; ancho: number; x: number; y: number };
  ruedas: readonly number[];
  /** destellos en diagonal sobre cada vidrio */
  destello: boolean;
  /** otro parabrisas más arriba, para el bus de dos pisos */
  frenteAlto?: string;
}

function fila(
  xs: readonly number[],
  y: number,
  ancho: number,
  alto: number,
  rx: number,
): Ventana[] {
  return xs.map((x) => ({ alto, ancho, rx, x, y }));
}

export type NombreForma =
  'coaster' | 'doble' | 'estandar' | 'expreso' | 'micro';

export const FORMAS: Readonly<Record<NombreForma, Forma>> = {
  estandar: {
    banda: { alto: 36, y: 172 },
    carroceria:
      'M76,52 H398 C430,52 448,64 460,90 L494,170 C500,184 502,194 502,208 V230 C502,242 494,248 482,248 H54 C40,248 32,240 32,228 V94 C32,70 48,52 76,52 Z',
    destello: true,
    dx: 0,
    frente: 'M408,86 H438 C450,86 458,94 464,108 L482,152 H408 Z',
    letrero: { alto: 19, ancho: 58, x: 410, y: 60 },
    ruedas: [128, 396],
    ventanas: fila([62, 148, 234, 320], 86, 74, 66, 16),
  },
  coaster: {
    banda: { alto: 34, y: 174 },
    carroceria:
      'M120,52 H398 C430,52 448,64 460,90 L494,170 C500,184 502,194 502,208 V230 C502,242 494,248 482,248 H96 C82,248 74,240 74,228 V98 C74,72 92,52 120,52 Z',
    destello: true,
    dx: -26,
    frente: 'M408,86 H438 C450,86 458,94 464,108 L482,152 H408 Z',
    letrero: { alto: 19, ancho: 58, x: 410, y: 60 },
    ruedas: [160, 396],
    ventanas: fila([102, 196, 290], 86, 86, 66, 18),
  },
  expreso: {
    banda: { alto: 30, y: 178 },
    carroceria:
      'M48,70 H398 C428,70 446,80 458,100 L494,172 C500,186 502,196 502,208 V230 C502,242 494,248 482,248 H36 C24,248 18,240 18,228 V100 C18,82 30,70 48,70 Z',
    destello: false,
    dx: 0,
    frente: 'M408,96 H438 C450,96 458,102 464,114 L484,152 H408 Z',
    letrero: { alto: 17, ancho: 56, x: 410, y: 73 },
    ruedas: [104, 396],
    ventanas: fila([34, 106, 178, 250, 322], 96, 62, 56, 13),
  },
  micro: {
    banda: { alto: 34, y: 176 },
    carroceria:
      'M196,58 H380 C420,58 446,74 462,102 L494,170 C500,184 502,194 502,208 V230 C502,242 494,248 482,248 H176 C162,248 156,240 156,228 V96 C156,74 172,58 196,58 Z',
    destello: true,
    dx: -62,
    frente: 'M370,84 H410 C440,84 456,98 464,114 L484,152 H370 Z',
    letrero: { alto: 16, ancho: 52, x: 388, y: 62 },
    ruedas: [232, 396],
    ventanas: fila([178, 276], 84, 86, 68, 16),
  },
  doble: {
    banda: { alto: 28, y: 184 },
    carroceria:
      'M72,22 H398 C430,22 448,34 460,60 L494,150 C500,170 502,186 502,208 V230 C502,242 494,248 482,248 H50 C36,248 28,240 28,228 V66 C28,40 44,22 72,22 Z',
    destello: false,
    dx: 0,
    frente: 'M408,112 H438 C450,112 458,120 464,134 L484,166 H408 Z',
    frenteAlto: 'M408,38 H436 C446,38 454,44 458,56 L470,88 H408 Z',
    letrero: { alto: 16, ancho: 56, x: 410, y: 92 },
    ruedas: [124, 396],
    ventanas: [
      ...fila([48, 118, 188, 258, 328], 38, 62, 46, 10),
      ...fila([48, 118, 188, 258], 114, 62, 52, 10),
    ],
  },
};
