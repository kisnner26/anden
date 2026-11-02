// modelo de dominio de 03-arquitectura.md; fechas y horas como texto ISO 8601

export const TIPOS_BUS = ['ordinario', 'interlocal', 'expreso'] as const;
export type TipoBus = (typeof TIPOS_BUS)[number];

export const CONFIGURACIONES_BUS = ['micro15', 'coaster26', 'bus45'] as const;
export type ConfiguracionBus = (typeof CONFIGURACIONES_BUS)[number];

export const COMODIDADES = [
  'aire-acondicionado',
  'carga-usb',
  'wifi',
  'bano',
] as const;
export type Comodidad = (typeof COMODIDADES)[number];

export const ESTADOS_VIAJE = [
  'programado',
  'abordando',
  'en-ruta',
  'llego',
  'atrasado',
  'cancelado',
] as const;
export type EstadoViaje = (typeof ESTADOS_VIAJE)[number];

export const TIPOS_ASIENTO = ['ventana', 'pasillo', 'preferencial'] as const;
export type TipoAsiento = (typeof TIPOS_ASIENTO)[number];

export const ESTADOS_BOLETO = [
  'vigente',
  'usado',
  'cancelado',
  'reembolsado',
] as const;
export type EstadoBoleto = (typeof ESTADOS_BOLETO)[number];

export const ETIQUETAS_CALIFICACION = [
  'puntual',
  'manejo-seguro',
  'amable',
  'limpio',
] as const;
export type EtiquetaCalificacion = (typeof ETIQUETAS_CALIFICACION)[number];

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface Terminal {
  id: string;
  nombre: string;
  ciudad: string;
  /** tres letras, por ejemplo UCA */
  codigo: string;
  coordenadas: Coordenadas;
  andenes: number;
}

/** parada de una ruta: una terminal o un punto de la carretera */
export type Parada =
  | { tipo: 'terminal'; terminalId: string; minutosDesdeOrigen: number }
  | {
      tipo: 'punto';
      nombre: string;
      coordenadas: Coordenadas;
      minutosDesdeOrigen: number;
    };

export interface Ruta {
  id: string;
  origenId: string;
  destinoId: string;
  paradas: Parada[];
  distanciaKm: number;
  duracionMin: number;
  /** córdobas enteros por el recorrido completo en bus ordinario */
  tarifaBase: number;
}

export interface Bus {
  id: string;
  placa: string;
  cooperativa: string;
  tipo: TipoBus;
  configuracion: ConfiguracionBus;
  comodidades: Comodidad[];
}

export interface Chofer {
  id: string;
  nombre: string;
  fotoUrl: string;
  aniosManejando: number;
  licenciaVerificada: boolean;
  viajesRealizados: number;
}

export interface Viaje {
  id: string;
  rutaId: string;
  busId: string;
  choferId: string;
  salida: string;
  anden: number;
  estado: EstadoViaje;
  minutosAtraso: number;
}

export interface Asiento {
  numero: number;
  fila: number;
  columna: number;
  tipo: TipoAsiento;
}

export interface Retencion {
  id: string;
  viajeId: string;
  asientos: number[];
  expira: string;
  duenoId: string;
}

export interface Pasajero {
  nombre: string;
  cedula?: string;
  esMenorEnBrazos: boolean;
}

export interface Boleto {
  id: string;
  /** ocho caracteres, el último es dígito de control */
  codigo: string;
  viajeId: string;
  duenoId: string;
  asiento: number;
  pasajero: Pasajero;
  /** córdobas enteros */
  precio: number;
  estado: EstadoBoleto;
  compradoEn: string;
}

export interface Calificacion {
  boletoId: string;
  choferId: string;
  estrellas: 1 | 2 | 3 | 4 | 5;
  etiquetas: EtiquetaCalificacion[];
}

export interface PosicionBus {
  viajeId: string;
  coordenadas: Coordenadas;
  registradaEn: string;
}
