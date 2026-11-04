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
    codigo: 'MAY',
    coordenadas: { lat: 12.13413, lng: -86.1933 },
    id: 'ter_uca',
    nombre: 'Mercado Mayoreo',
  },
  {
    andenes: 3,
    ciudad: 'Boaco',
    codigo: 'BOA',
    coordenadas: { lat: 12.46901, lng: -85.65587 },
    id: 'ter_boa',
    nombre: 'Terminal de Buses de Managua',
  },
  {
    andenes: 3,
    ciudad: 'Juigalpa',
    codigo: 'JUI',
    coordenadas: { lat: 12.09172, lng: -85.36106 },
    id: 'ter_jui',
    nombre: 'Terminal Mayales',
  },
];

/** destino, kilómetros y minutos de cada ruta que sale de la terminal UCA */
const RECORRIDOS = [
  { codigo: 'boa', distanciaKm: 90, duracionMin: 100 },
  { codigo: 'jui', distanciaKm: 139, duracionMin: 150 },
] as const;

export const RUTAS: Ruta[] = RECORRIDOS.flatMap((recorrido) => [
  {
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
  },
  {
    destinoId: 'ter_uca',
    distanciaKm: recorrido.distanciaKm,
    duracionMin: recorrido.duracionMin,
    id: `rut_${recorrido.codigo}_uca`,
    origenId: `ter_${recorrido.codigo}`,
    paradas: [
      {
        minutosDesdeOrigen: 0,
        terminalId: `ter_${recorrido.codigo}`,
        tipo: 'terminal',
      },
      {
        minutosDesdeOrigen: recorrido.duracionMin,
        terminalId: 'ter_uca',
        tipo: 'terminal',
      },
    ],
  },
]);

/** tarifa de muestra en córdobas por ruta y servicio */
const TARIFAS: Record<string, Partial<Record<TipoServicio, number>>> = {
  boa: { 'taxi-interlocal': 95, expreso: 85, ordinario: 70 },
  jui: { expreso: 130, ordinario: 110 },
};

export const TARIFARIO: Tarifario = RECORRIDOS.flatMap((recorrido) =>
  Object.entries(TARIFAS[recorrido.codigo] ?? {})
    .map(([servicio, cordobas]) => ({
      cordobas,
      desdeParada: 0,
      hastaParada: 1,
      resolucion: 'muestra',
      rutaId: `rut_uca_${recorrido.codigo}`,
      servicio: servicio as TipoServicio,
    }))
    .flatMap((tarifa) => [
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
  { anden: 3, atraso: 0, desde: -10, destino: 'boa', servicio: 'ordinario' },
  { anden: 3, atraso: 0, desde: 20, destino: 'boa', servicio: 'ordinario' },
  { anden: 4, atraso: 0, desde: 28, destino: 'jui', servicio: 'ordinario' },
  { anden: 1, atraso: 10, desde: 32, destino: 'jui', servicio: 'expreso' },
  {
    anden: 6,
    atraso: 0,
    desde: 40,
    destino: 'boa',
    servicio: 'taxi-interlocal',
  },
  { anden: 4, atraso: 0, desde: 55, destino: 'jui', servicio: 'ordinario' },
  { anden: 2, atraso: 0, desde: 65, destino: 'boa', servicio: 'expreso' },
  { anden: 1, atraso: 0, desde: 80, destino: 'jui', servicio: 'expreso' },
  {
    anden: 1,
    atraso: 0,
    desde: 18,
    destino: 'uca',
    origen: 'boa',
    servicio: 'ordinario',
  },
  {
    anden: 2,
    atraso: 0,
    desde: 26,
    destino: 'uca',
    origen: 'jui',
    servicio: 'ordinario',
  },
  {
    anden: 1,
    atraso: 0,
    desde: 34,
    destino: 'uca',
    origen: 'boa',
    servicio: 'taxi-interlocal',
  },
  {
    anden: 2,
    atraso: 0,
    desde: 42,
    destino: 'uca',
    origen: 'jui',
    servicio: 'expreso',
  },
  {
    anden: 1,
    atraso: 0,
    desde: 50,
    destino: 'uca',
    origen: 'boa',
    servicio: 'ordinario',
  },
  {
    anden: 2,
    atraso: 0,
    desde: 58,
    destino: 'uca',
    origen: 'jui',
    servicio: 'ordinario',
  },
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

/** id del viaje de la salida de Boaco, el que tiene el plano de asientos con ocupaciones */
export const VIAJE_BOACO = 'via_2';

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
      viajeId: VIAJE_BOACO,
    }),
  );
  const apartados = [6, 15].map<Ocupacion>((asiento) => ({
    asiento,
    duenoId: 'usu_otro',
    estado: 'retenido',
    expira: vence,
    viajeId: VIAJE_BOACO,
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
