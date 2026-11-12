export const espacios = {
  trazo: 1,
  trazoDoble: 2,
  cuatro: 4,
  ocho: 8,
  doce: 12,
  dieciseis: 16,
  lateral: 20,
  veinticuatro: 24,
  treintaYDos: 32,
  cuarentaYOcho: 48,
} as const;

export const radios = {
  asiento: 12,
  bloque: 26,
  bloqueNegro: 30,
  carcasa: 56,
  casilla: 16,
  cuadrado: 4,
  loseta: 18,
  pildora: 999,
  tarjeta: 20,
} as const;

export const tamanosControl = {
  altoBoton: 56,
  circuloPildora: 44,
  toqueMinimo: 44,
} as const;

export const tamanosIcono = {
  pequeno: 16,
  mediano: 20,
  grande: 24,
  destacado: 26,
  ilustracion: 34,
} as const;

export const disposicionPantalla = {
  anchoMaximo: 480,
  espacioPie: 220,
  espacioPieReserva: 200,
  rellenoHeroDetalle: 44,
  /** aire al final de cada pestaña; la barra nativa ya suma su alto al área segura */
  espacioFinalPestana: espacios.treintaYDos,
  rellenoInferior: espacios.cuarentaYOcho,
  rellenoSuperior: espacios.ocho,
  margenFlotante: 14,
} as const;

export const tamanosIlustracion = {
  avatarAjustes: 56,
  autobusCorredor: 116,
  autobusProximo: 262,
  busDetalleSolape: 84,
  confirmacionReserva: 88,
  espacioAutobusProximo: 106,
  solapeAutobusProximo: 114,
} as const;

/** medidas del pase de abordar */
export const tamanosBoleto = {
  muesca: 28,
} as const;

export const tamanosTablero = {
  altoAnden: 32,
  altoEncabezado: 36,
  altoFicha: 28,
  altoFila: 60,
  anchoAnden: 36,
  anchoColumnaAnden: 40,
  anchoColumnaEstado: 88,
  anchoColumnaHora: 72,
  anchoFicha: 15,
  anchoSeparador: 6,
  marcaEstado: 8,
} as const;
