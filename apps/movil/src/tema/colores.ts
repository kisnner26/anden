export const coloresOscuros = {
  aTiempo: '#5FD39A',
  ambar: '#FFB21E',
  atrasado: '#FF7A59',
  cancelado: '#FF5A6E',
  fondo: '#0E0F11',
  linea: '#2C3036',
  papel: '#F2EBDD',
  sobreAmbar: '#1A1205',
  superficie: '#16181B',
  superficieAlta: '#1F2226',
  tinta: '#F2EFE8',
  tintaPapel: '#1B1A17',
  tintaSuave: '#A9A59C',
} as const;

export const coloresClaros = {
  aTiempo: '#1E8A57',
  ambar: '#B86E00',
  atrasado: '#C2410C',
  cancelado: '#B4233A',
  fondo: '#F4F1EA',
  linea: '#DDD8CC',
  papel: '#F2EBDD',
  sobreAmbar: '#FFFFFF',
  superficie: '#FBF9F4',
  superficieAlta: '#FFFFFF',
  tinta: '#141517',
  tintaPapel: '#1B1A17',
  tintaSuave: '#5C5A55',
} as const satisfies Record<keyof typeof coloresOscuros, string>;

export type Colores = typeof coloresOscuros;

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
