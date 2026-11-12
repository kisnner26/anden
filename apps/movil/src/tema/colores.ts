export const coloresOscuros = {
  aTiempo: '#5FD39A',
  ambar: '#FFB21E',
  ambarProfundo: '#E08C00',
  ambarTexto: '#FFB21E',
  ambarTitular: '#FFB21E',
  atrasado: '#FF7A59',
  barroClaro: '#2A2923',
  barroOscuro: '#1C1B17',
  bloqueNegro: '#0B0B09',
  bloqueNegroClaro: '#191914',
  cancelado: '#FF5A6E',
  fondo: '#121210',
  fondoProfundo: '#0B0B09',
  linea: '#34322B',
  luzRelieve: '#FFFFFF',
  marcaAbajo: '#3B3A33',
  marcaArriba: '#5A574D',
  papel: '#F2EBDD',
  sobreAmbar: '#1A1205',
  sobreNegro: '#FFFFFF',
  sobreNegroSuave: '#B9B3A2',
  sombraRelieve: '#000000',
  superficie: '#201F1B',
  superficieAlta: '#2B2A25',
  tinta: '#F2EFE8',
  tintaPapel: '#1B1A17',
  tintaSuave: '#A9A59C',
} as const;

export const coloresClaros = {
  aTiempo: '#166D43',
  ambar: '#FFB21E',
  ambarProfundo: '#F29A00',
  ambarTexto: '#874F00',
  ambarTitular: '#B86E00',
  atrasado: '#A8360A',
  barroClaro: '#F2EDE1',
  barroOscuro: '#E3DCCB',
  bloqueNegro: '#1C1B17',
  bloqueNegroClaro: '#2A2923',
  cancelado: '#B4233A',
  fondo: '#F5F1E8',
  fondoProfundo: '#E8E1D1',
  linea: '#D8D0BD',
  luzRelieve: '#FFFFFF',
  marcaAbajo: '#6E6A5F',
  marcaArriba: '#9B968A',
  papel: '#F2EBDD',
  sobreAmbar: '#1A1205',
  sobreNegro: '#FFFFFF',
  sobreNegroSuave: '#B9B3A2',
  sombraRelieve: '#7D6941',
  superficie: '#EDE7DA',
  superficieAlta: '#FBF8EF',
  tinta: '#17160F',
  tintaPapel: '#1B1A17',
  tintaSuave: '#605B50',
} as const satisfies Record<keyof typeof coloresOscuros, string>;

export type Colores = Record<keyof typeof coloresOscuros, string>;

/** colores de los íconos ilustrados; son los mismos en claro y oscuro */
export const paletaIconos = {
  ambarBorde: '#B86E00',
  ambarClaro: '#FFE59A',
  ambar: '#FFB21E',
  ambarOscuro: '#DE8500',
  barras: '#2A1A02',
  brillo: '#FFFFFF',
  cremaClara: '#FFFFFF',
  cremaOscura: '#D9D0BA',
  manecillas: '#E48A00',
  negroClaro: '#55544A',
  negroOscuro: '#0F0F0C',
  negroTrazo: '#2B2A25',
  perforado: '#8A4F00',
  rueda: '#17160F',
  verdeClaro: '#9BE8BE',
  verdeOscuro: '#2E9E6B',
} as const;

/** colores del bus de personaje; son los mismos en claro y oscuro */
export const paletaAutobus = {
  banda: '#FFB21E',
  bandaClara: '#FFD468',
  bandaOscura: '#E08C00',
  borde: '#8A6A22',
  carroceriaClara: '#FFFDF7',
  carroceriaMedia: '#F1E8D2',
  carroceriaOscura: '#D8CCB0',
  faro: '#FFF1B8',
  faroBorde: '#E5B84A',
  faroBrillo: '#FFC94D',
  llantaClara: '#FFFFFF',
  llantaOscura: '#B9B2A0',
  paragolpes: '#262520',
  rueda: '#13120F',
  ruedaArco: '#1B1A16',
  ruedaCentro: '#6B665A',
  sombraSuelo: '#3A2A08',
  vidrioClaro: '#3A414B',
  vidrioOscuro: '#11141A',
} as const;

export type NombrePaletaAutobus =
  | 'ambar'
  | 'azul'
  | 'blanco'
  | 'grafito'
  | 'naranja'
  | 'rojo'
  | 'turquesa'
  | 'verde'
  | 'violeta';

type PaletaAutobus = { -readonly [K in keyof typeof paletaAutobus]: string };

function conBanda(
  carroceria: [string, string, string],
  banda: [string, string, string],
  borde: string,
): Partial<PaletaAutobus> {
  return {
    banda: banda[1],
    bandaClara: banda[0],
    bandaOscura: banda[2],
    borde,
    carroceriaClara: carroceria[0],
    carroceriaMedia: carroceria[1],
    carroceriaOscura: carroceria[2],
  };
}

/** los colores de cada variante del bus; lo que no se redefine queda como en la paleta base */
export const paletasAutobus: Readonly<
  Record<NombrePaletaAutobus, Partial<PaletaAutobus>>
> = {
  ambar: {},
  azul: conBanda(
    ['#F4F8FF', '#DCE7F7', '#B9CBE6'],
    ['#6FA0F5', '#2F6FE4', '#1F4FB0'],
    '#1F3F7A',
  ),
  blanco: conBanda(
    ['#FFFFFF', '#F1F1F1', '#D9D9D9'],
    ['#555555', '#2B2B2B', '#111111'],
    '#444444',
  ),
  grafito: {
    ...conBanda(
      ['#6B717B', '#464B54', '#272A30'],
      ['#FFD468', '#FFB21E', '#E08C00'],
      '#000000',
    ),
    vidrioClaro: '#5B6572',
    vidrioOscuro: '#222831',
  },
  naranja: conBanda(
    ['#FFF9F2', '#F7E4CE', '#E4C8A3'],
    ['#FF9B5E', '#F26B1D', '#C24A08'],
    '#8A3F10',
  ),
  rojo: conBanda(
    ['#FFF7F5', '#F3DDD7', '#DDBAB0'],
    ['#F58A7B', '#E04B3A', '#B02E20'],
    '#7A2A20',
  ),
  turquesa: conBanda(
    ['#F3FBFB', '#D7ECEC', '#B3D4D4'],
    ['#5BD0D0', '#14A5A5', '#0C7676'],
    '#0C5A5A',
  ),
  verde: conBanda(
    ['#F5FBF4', '#DCEBD8', '#BBD3B3'],
    ['#6CCB8C', '#2E9B57', '#1D6F3C'],
    '#1D4F2C',
  ),
  violeta: conBanda(
    ['#FAF6FF', '#E6DDF4', '#CBBCE3'],
    ['#A98BEE', '#7A4FD0', '#5A33A8'],
    '#3F2478',
  ),
};
