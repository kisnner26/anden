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
import { DIAS_DE_RESERVA, sumarDias } from './dias';
import { TRAZOS } from './trazos';

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
    id: 'ter_may',
    nombre: 'Mercado Mayoreo',
  },
  {
    andenes: 3,
    ciudad: 'Boaco',
    codigo: 'BOA',
    coordenadas: { lat: 12.46781, lng: -85.65786 },
    id: 'ter_boa',
    nombre: 'Terminal de Buses de Boaco',
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

/** destino, kilómetros y minutos de cada ruta que sale de Mercado Mayoreo */
const RECORRIDOS = [
  {
    codigo: 'boa',
    distanciaKm: TRAZOS.boa.distanciaKm,
    duracionMin: TRAZOS.boa.duracionMin,
  },
  {
    codigo: 'jui',
    distanciaKm: TRAZOS.jui.distanciaKm,
    duracionMin: TRAZOS.jui.duracionMin,
  },
] as const;

export const RUTAS: Ruta[] = RECORRIDOS.flatMap((recorrido) => [
  {
    destinoId: `ter_${recorrido.codigo}`,
    distanciaKm: recorrido.distanciaKm,
    duracionMin: recorrido.duracionMin,
    id: `rut_may_${recorrido.codigo}`,
    origenId: 'ter_may',
    paradas: [
      { minutosDesdeOrigen: 0, terminalId: 'ter_may', tipo: 'terminal' },
      {
        minutosDesdeOrigen: recorrido.duracionMin,
        terminalId: `ter_${recorrido.codigo}`,
        tipo: 'terminal',
      },
    ],
  },
  {
    destinoId: 'ter_may',
    distanciaKm: recorrido.distanciaKm,
    duracionMin: recorrido.duracionMin,
    id: `rut_${recorrido.codigo}_may`,
    origenId: `ter_${recorrido.codigo}`,
    paradas: [
      {
        minutosDesdeOrigen: 0,
        terminalId: `ter_${recorrido.codigo}`,
        tipo: 'terminal',
      },
      {
        minutosDesdeOrigen: recorrido.duracionMin,
        terminalId: 'ter_may',
        tipo: 'terminal',
      },
    ],
  },
]);

/** tarifa de muestra en córdobas por ruta y servicio */
const TARIFAS: Record<string, Partial<Record<TipoServicio, number>>> = {
  boa: { expreso: 85, ordinario: 66 },
  jui: { expreso: 130, ordinario: 110 },
};

export const TARIFARIO: Tarifario = RECORRIDOS.flatMap((recorrido) =>
  Object.entries(TARIFAS[recorrido.codigo] ?? {})
    .map(([servicio, cordobas]) => ({
      cordobas,
      desdeParada: 0,
      hastaParada: 1,
      resolucion: 'muestra',
      rutaId: `rut_may_${recorrido.codigo}`,
      servicio: servicio as TipoServicio,
    }))
    .flatMap((tarifa) => [
      tarifa,
      { ...tarifa, rutaId: `rut_${recorrido.codigo}_may` },
    ]),
);

export const CONFIGURACION_POR_SERVICIO: Record<
  TipoServicio,
  ConfiguracionBus
> = {
  expreso: 'bus45',
  ordinario: 'coaster26',
};

const NOMBRES_CHOFER = [
  'Ernesto Calero',
  'Marvin Lanzas',
  'Iván Obando',
  'Rosario Téllez',
] as const;

/** salidas de muestra, en minutos respecto de la hora actual */
const SALIDAS: Array<{
  puntoEncuentro: string;
  atraso: number;
  desde: number;
  destino: string;
  origen?: string;
  servicio: TipoServicio;
}> = [
  {
    puntoEncuentro: '764M4PPX+HC',
    atraso: 0,
    desde: -10,
    destino: 'boa',
    servicio: 'ordinario',
  },
  {
    puntoEncuentro: '764M4PPX+HC',
    atraso: 0,
    desde: 20,
    destino: 'boa',
    servicio: 'ordinario',
  },
  {
    puntoEncuentro: '764M4PPX+HC',
    atraso: 0,
    desde: 28,
    destino: 'jui',
    servicio: 'ordinario',
  },
  {
    puntoEncuentro: '764M4PPX+HC',
    atraso: 10,
    desde: 32,
    destino: 'jui',
    servicio: 'expreso',
  },
  {
    puntoEncuentro: '764M4PPX+HC',
    atraso: 0,
    desde: 40,
    destino: 'boa',
    servicio: 'ordinario',
  },
  {
    puntoEncuentro: '764M4PPX+HC',
    atraso: 0,
    desde: 55,
    destino: 'jui',
    servicio: 'ordinario',
  },
  {
    puntoEncuentro: '764M4PPX+HC',
    atraso: 0,
    desde: 65,
    destino: 'boa',
    servicio: 'expreso',
  },
  {
    puntoEncuentro: '764M4PPX+HC',
    atraso: 0,
    desde: 80,
    destino: 'jui',
    servicio: 'expreso',
  },
  {
    puntoEncuentro: '764PF89R+P4',
    atraso: 0,
    desde: 18,
    destino: 'may',
    origen: 'boa',
    servicio: 'ordinario',
  },
  {
    puntoEncuentro: '764P4J4P+FH',
    atraso: 0,
    desde: 26,
    destino: 'may',
    origen: 'jui',
    servicio: 'ordinario',
  },
  {
    puntoEncuentro: '764PF89R+P4',
    atraso: 0,
    desde: 34,
    destino: 'may',
    origen: 'boa',
    servicio: 'ordinario',
  },
  {
    puntoEncuentro: '764P4J4P+FH',
    atraso: 0,
    desde: 42,
    destino: 'may',
    origen: 'jui',
    servicio: 'expreso',
  },
  {
    puntoEncuentro: '764PF89R+P4',
    atraso: 0,
    desde: 50,
    destino: 'may',
    origen: 'boa',
    servicio: 'ordinario',
  },
  {
    puntoEncuentro: '764P4J4P+FH',
    atraso: 0,
    desde: 58,
    destino: 'may',
    origen: 'jui',
    servicio: 'ordinario',
  },
] as const;

/** salidas fijas de cada día para los días siguientes: las mismas horas en los cuatro sentidos */
const HORARIO_DIARIO: ReadonlyArray<{
  hora: number;
  minuto: number;
  servicio: TipoServicio;
}> = [
  { hora: 5, minuto: 30, servicio: 'ordinario' },
  { hora: 7, minuto: 0, servicio: 'expreso' },
  { hora: 9, minuto: 30, servicio: 'ordinario' },
  { hora: 12, minuto: 0, servicio: 'ordinario' },
  { hora: 15, minuto: 0, servicio: 'expreso' },
  { hora: 17, minuto: 30, servicio: 'ordinario' },
];

const SENTIDOS_DIARIOS = [
  { puntoEncuentro: '764M4PPX+HC', rutaId: 'rut_may_boa' },
  { puntoEncuentro: '764M4PPX+HC', rutaId: 'rut_may_jui' },
  { puntoEncuentro: '764PF89R+P4', rutaId: 'rut_boa_may' },
  { puntoEncuentro: '764P4J4P+FH', rutaId: 'rut_jui_may' },
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

/**
 * lo único que viene con la app: terminales, rutas y tarifa oficial, que fija el MTI. Los viajes,
 * las unidades, los choferes y los asientos vendidos los publican los conductores y llegan del servidor.
 */
export function crearBase(): DatosMuestra {
  return {
    buses: [],
    calificaciones: [],
    choferes: [],
    ocupaciones: [],
    rutas: RUTAS,
    tarifario: TARIFARIO,
    terminales: TERMINALES,
    viajes: [],
  };
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
      puntoEncuentro: salida.puntoEncuentro,
      busId: `bus_${numero}`,
      choferId: `cho_${(indice % choferes.length) + 1}`,
      estado: salida.atraso > 0 ? 'atrasado' : 'programado',
      id: `via_${numero}`,
      minutosAtraso: salida.atraso,
      rutaId: salida.origen
        ? `rut_${salida.origen}_may`
        : `rut_may_${salida.destino}`,
      salida: new Date(ahora.getTime() + salida.desde * 60_000).toISOString(),
    });
  });

  // los días siguientes: un horario fijo por sentido, para poder reservar con anticipación
  let secuencia = 0;
  for (let dia = 1; dia < DIAS_DE_RESERVA; dia += 1) {
    const base = sumarDias(ahora, dia);
    SENTIDOS_DIARIOS.forEach((sentido, s) => {
      HORARIO_DIARIO.forEach((horario, h) => {
        secuencia += 1;
        const id = `d${dia}_${s}_${h}`;
        buses.push({
          comodidades:
            horario.servicio === 'expreso'
              ? ['aire-acondicionado', 'carga-usb']
              : [],
          configuracion: CONFIGURACION_POR_SERVICIO[horario.servicio],
          cooperativa: 'Cooperativa de muestra',
          id: `bus_${id}`,
          placa: `M ${300 + secuencia}-${100 + (secuencia % 90)}`,
          servicio: horario.servicio,
        });
        viajes.push({
          puntoEncuentro: sentido.puntoEncuentro,
          busId: `bus_${id}`,
          choferId: `cho_${(secuencia % choferes.length) + 1}`,
          estado: 'programado',
          id: `via_${id}`,
          minutosAtraso: 0,
          rutaId: sentido.rutaId,
          salida: new Date(
            base.getFullYear(),
            base.getMonth(),
            base.getDate(),
            horario.hora,
            horario.minuto,
          ).toISOString(),
        });
      });
    });
  }

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
