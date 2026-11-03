// datos de muestra: no son oficiales. Las tarifas reales las fija el MTI (ver docs/plan/05-marco-mti.md).
import type {
  Bus,
  Calificacion,
  Chofer,
  ConfiguracionBus,
  Ocupacion,
  Ruta,
  Tarifario,
  Terminal,
  TipoServicio,
  Viaje,
} from '@anden/dominio';

export interface DatosMuestra {
  buses: Bus[];
  calificaciones: Calificacion[];
  choferes: Chofer[];
  ocupaciones: Ocupacion[];
  rutas: Ruta[];
  tarifario: Tarifario;
  terminales: Terminal[];
  viajes: Viaje[];
}

export const TERMINALES: Terminal[] = [
  {
    andenes: 6,
    ciudad: 'Managua',
    codigo: 'UCA',
    coordenadas: { lat: 12.1328, lng: -86.2504 },
    id: 'ter_uca',
    nombre: 'Terminal UCA',
  },
  {
    andenes: 4,
    ciudad: 'Granada',
    codigo: 'GRA',
    coordenadas: { lat: 11.93, lng: -85.956 },
    id: 'ter_gra',
    nombre: 'Terminal Granada',
  },
  {
    andenes: 3,
    ciudad: 'Masaya',
    codigo: 'MAS',
    coordenadas: { lat: 11.974, lng: -86.094 },
    id: 'ter_mas',
    nombre: 'Terminal Masaya',
  },
  {
    andenes: 3,
    ciudad: 'Jinotepe',
    codigo: 'JIN',
    coordenadas: { lat: 11.85, lng: -86.2 },
    id: 'ter_jin',
    nombre: 'Terminal Jinotepe',
  },
  {
    andenes: 4,
    ciudad: 'León',
    codigo: 'LEO',
    coordenadas: { lat: 12.4379, lng: -86.878 },
    id: 'ter_leo',
    nombre: 'Terminal León',
  },
  {
    andenes: 3,
    ciudad: 'Estelí',
    codigo: 'EST',
    coordenadas: { lat: 13.09, lng: -86.354 },
    id: 'ter_est',
    nombre: 'Terminal Estelí',
  },
  {
    andenes: 3,
    ciudad: 'Diriamba',
    codigo: 'DIR',
    coordenadas: { lat: 11.857, lng: -86.24 },
    id: 'ter_dir',
    nombre: 'Terminal Diriamba',
  },
];

/** destino, kilómetros y minutos de cada ruta que sale de la terminal UCA */
const RECORRIDOS = [
  { codigo: 'gra', distanciaKm: 45, duracionMin: 55 },
  { codigo: 'mas', distanciaKm: 30, duracionMin: 40 },
  { codigo: 'jin', distanciaKm: 45, duracionMin: 70 },
  { codigo: 'leo', distanciaKm: 90, duracionMin: 95 },
  { codigo: 'est', distanciaKm: 148, duracionMin: 150 },
  { codigo: 'dir', distanciaKm: 42, duracionMin: 60 },
] as const;

export const RUTAS: Ruta[] = RECORRIDOS.flatMap((recorrido) => [({
  destinoId: `ter_${recorrido.codigo}`,
  distanciaKm: recorrido.distanciaKm,
  duracionMin: recorrido.duracionMin,
  id: `rut_uca_${recorrido.codigo}`,
  origenId: 'ter_uca',
  paradas: [
    { minutosDesdeOrigen: 0, terminalId: 'ter_uca', tipo: 'terminal' },
    {
      minutosDesdeOrigen: recorrido.duracionMin,
      terminalId: `ter_${recorrido.codigo}`,
      tipo: 'terminal',
    },
  ],
}), ({
  destinoId: 'ter_uca',
  distanciaKm: recorrido.distanciaKm,
  duracionMin: recorrido.duracionMin,
  id: `rut_${recorrido.codigo}_uca`,
  origenId: `ter_${recorrido.codigo}`,
  paradas: [
    { minutosDesdeOrigen: 0, terminalId: `ter_${recorrido.codigo}`, tipo: 'terminal' },
    { minutosDesdeOrigen: recorrido.duracionMin, terminalId: 'ter_uca', tipo: 'terminal' },
  ],
})]);

/** tarifa de muestra en córdobas por ruta y servicio */
const TARIFAS: Record<string, Partial<Record<TipoServicio, number>>> = {
  dir: { ordinario: 40 },
  est: { expreso: 120 },
  gra: { ordinario: 46 },
  jin: { 'taxi-interlocal': 58, ordinario: 44 },
  leo: { expreso: 95 },
  mas: { expreso: 38, ordinario: 32 },
};

export const TARIFARIO: Tarifario = RECORRIDOS.flatMap((recorrido) =>
  Object.entries(TARIFAS[recorrido.codigo] ?? {}).map(
    ([servicio, cordobas]) => ({
      cordobas,
      desdeParada: 0,
      hastaParada: 1,
      resolucion: 'muestra',
      rutaId: `rut_uca_${recorrido.codigo}`,
      servicio: servicio as TipoServicio,
    }),
  ).flatMap((tarifa) => [
    tarifa,
    { ...tarifa, rutaId: `rut_${recorrido.codigo}_uca` },
  ]),
);

const CONFIGURACION_POR_SERVICIO: Record<TipoServicio, ConfiguracionBus> = {
  expreso: 'bus45',
  ordinario: 'coaster26',
  'taxi-interlocal': 'micro15',
};

const NOMBRES_CHOFER = [
  'Ernesto Calero',
  'Marvin Lanzas',
  'Iván Obando',
  'Rosario Téllez',
] as const;

/** salidas de muestra, en minutos respecto de la hora actual */
const SALIDAS: Array<{
  anden: number;
  atraso: number;
  desde: number;
  destino: string;
  origen?: string;
  servicio: TipoServicio;
}> = [
  { anden: 3, atraso: 0, desde: -10, destino: 'mas', servicio: 'ordinario' },
  { anden: 4, atraso: 0, desde: 20, destino: 'gra', servicio: 'ordinario' },
  { anden: 6, atraso: 0, desde: 28, destino: 'jin', servicio: 'ordinario' },
  { anden: 1, atraso: 10, desde: 32, destino: 'leo', servicio: 'expreso' },
  {
    anden: 6,
    atraso: 0,
    desde: 40,
    destino: 'jin',
    servicio: 'taxi-interlocal',
  },
  { anden: 5, atraso: 0, desde: 55, destino: 'dir', servicio: 'ordinario' },
  { anden: 2, atraso: 0, desde: 65, destino: 'mas', servicio: 'expreso' },
  { anden: 1, atraso: 0, desde: 80, destino: 'est', servicio: 'expreso' },
  { anden: 1, atraso: 0, desde: 18, destino: 'uca', origen: 'gra', servicio: 'ordinario' },
  { anden: 2, atraso: 0, desde: 26, destino: 'uca', origen: 'mas', servicio: 'ordinario' },
  { anden: 1, atraso: 0, desde: 34, destino: 'uca', origen: 'jin', servicio: 'ordinario' },
  { anden: 2, atraso: 0, desde: 42, destino: 'uca', origen: 'leo', servicio: 'expreso' },
  { anden: 1, atraso: 0, desde: 50, destino: 'uca', origen: 'est', servicio: 'expreso' },
  { anden: 2, atraso: 0, desde: 58, destino: 'uca', origen: 'dir', servicio: 'ordinario' },
] as const;

/** notas de muestra de cada chofer, de la más vieja a la más nueva */
const NOTAS_POR_CHOFER = [
  [5, 5, 4, 5, 5, 4, 5, 5, 5, 4, 5, 5, 4, 5, 5],
  [4, 5, 4, 4, 5, 4, 3, 5, 4, 4, 5, 4],
  [5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 5, 4, 5, 5, 4, 5, 4],
  [4, 4, 5, 3, 4, 5, 4, 4, 5, 4, 4, 5],
] as const;

const ETIQUETAS_POR_NOTA = {
  3: [],
  4: ['amable'],
  5: ['puntual', 'manejo-seguro'],
} as const;

function crearCalificaciones(): Calificacion[] {
  return NOTAS_POR_CHOFER.flatMap((notas, indice) =>
    notas.map<Calificacion>((estrellas, orden) => ({
      boletoId: `bol_hist_${indice + 1}_${orden + 1}`,
      choferId: `cho_${indice + 1}`,
      estrellas,
      etiquetas: [...ETIQUETAS_POR_NOTA[estrellas]],
    })),
  );
}

/** id del viaje de la salida de Granada, el que tiene el plano de asientos con ocupaciones */
export const VIAJE_GRANADA = 'via_2';

export function crearMuestra(ahora: Date): DatosMuestra {
  const viajes: Viaje[] = [];
  const buses: Bus[] = [];
  const choferes: Chofer[] = NOMBRES_CHOFER.map((nombre, indice) => ({
    aniosManejando: 6 + indice * 3,
    fotoUrl: `choferes/cho_${indice + 1}.png`,
    id: `cho_${indice + 1}`,
    licenciaVerificada: true,
    nombre,
    viajesRealizados: 1800 + indice * 700,
  }));

  SALIDAS.forEach((salida, indice) => {
    const numero = indice + 1;
    buses.push({
      comodidades:
        salida.servicio === 'expreso'
          ? ['aire-acondicionado', 'carga-usb']
          : [],
      configuracion: CONFIGURACION_POR_SERVICIO[salida.servicio],
      cooperativa: 'Cooperativa de muestra',
      id: `bus_${numero}`,
      placa: `M ${200 + numero * 11}-${100 + numero * 7}`,
      servicio: salida.servicio,
    });
    viajes.push({
      anden: salida.anden,
      busId: `bus_${numero}`,
      choferId: `cho_${(indice % choferes.length) + 1}`,
      estado: salida.atraso > 0 ? 'atrasado' : 'programado',
      id: `via_${numero}`,
      minutosAtraso: salida.atraso,
      rutaId: salida.origen
        ? `rut_${salida.origen}_uca`
        : `rut_uca_${salida.destino}`,
      salida: new Date(ahora.getTime() + salida.desde * 60_000).toISOString(),
    });
  });

  const vence = new Date(ahora.getTime() + 8 * 60_000).toISOString();
  const vendidos = [2, 3, 5, 10, 11, 14, 19, 22, 23].map<Ocupacion>(
    (asiento) => ({
      asiento,
      boletoId: `bol_${asiento}`,
      duenoId: 'usu_otro',
      estado: 'vendido',
      viajeId: VIAJE_GRANADA,
    }),
  );
  const apartados = [6, 15].map<Ocupacion>((asiento) => ({
    asiento,
    duenoId: 'usu_otro',
    estado: 'retenido',
    expira: vence,
    viajeId: VIAJE_GRANADA,
  }));

  return {
    buses,
    calificaciones: crearCalificaciones(),
    choferes,
    ocupaciones: [...vendidos, ...apartados],
    rutas: RUTAS,
    tarifario: TARIFARIO,
    terminales: TERMINALES,
    viajes,
  };
}
