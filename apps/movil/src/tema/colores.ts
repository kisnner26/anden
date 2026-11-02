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
