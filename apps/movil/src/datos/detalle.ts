import {
  asientosDe,
  llegadaEstimada,
  promedioChofer,
  type Comodidad,
  type EtiquetaCalificacion,
} from '@anden/dominio';

import type { DatosMuestra } from './muestra';
import { armarSalidas, type Salida } from './salidas';

export interface PerfilChofer {
  aniosManejando: number;
  /** etiquetas más repetidas en sus calificaciones, de mayor a menor */
  etiquetas: { cantidad: number; etiqueta: EtiquetaCalificacion }[];
  id: string;
  iniciales: string;
  licenciaVerificada: boolean;
  nombre: string;
  promedio: number | null;
  totalCalificaciones: number;
  viajesRealizados: number;
}

export interface ParadaVista {
  hora: Date;
  nombre: string;
  tipo: 'punto' | 'terminal';
}

export interface DetalleViaje {
  chofer: PerfilChofer;
  distanciaKm: number;
  duracionMin: number;
  llegada: Date;
  paradas: ParadaVista[];
  salida: Salida;
  unidad: {
    comodidades: Comodidad[];
    cooperativa: string;
    placa: string;
    plazas: number;
  };
}

const MAXIMO_ETIQUETAS = 3;

function inicialesDe(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join('');
}

export function armarPerfilChofer(
  datos: DatosMuestra,
  choferId: string,
): PerfilChofer | null {
  const chofer = datos.choferes.find((candidato) => candidato.id === choferId);
  if (!chofer) return null;

  const calificaciones = datos.calificaciones.filter(
    (calificacion) => calificacion.choferId === choferId,
  );
  const cuentas = new Map<EtiquetaCalificacion, number>();
  for (const calificacion of calificaciones) {
    for (const etiqueta of calificacion.etiquetas) {
      cuentas.set(etiqueta, (cuentas.get(etiqueta) ?? 0) + 1);
    }
  }
  const etiquetas = [...cuentas.entries()]
    .map(([etiqueta, cantidad]) => ({ cantidad, etiqueta }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, MAXIMO_ETIQUETAS);

  return {
    aniosManejando: chofer.aniosManejando,
    etiquetas,
    id: chofer.id,
    iniciales: inicialesDe(chofer.nombre),
    licenciaVerificada: chofer.licenciaVerificada,
    nombre: chofer.nombre,
    promedio: promedioChofer(calificaciones),
    totalCalificaciones: calificaciones.length,
    viajesRealizados: chofer.viajesRealizados,
  };
}

export function armarDetalle(
  datos: DatosMuestra,
  viajeId: string,
  ahora: Date,
): DetalleViaje | null {
  const viaje = datos.viajes.find((candidato) => candidato.id === viajeId);
  const ruta = datos.rutas.find((candidata) => candidata.id === viaje?.rutaId);
  const bus = datos.buses.find((candidato) => candidato.id === viaje?.busId);
  const salida = armarSalidas(datos, ahora).find(
    (candidata) => candidata.viajeId === viajeId,
  );
  if (!viaje || !ruta || !bus || !salida) return null;

  const chofer = armarPerfilChofer(datos, viaje.choferId);
  if (!chofer) return null;

  const paradas = ruta.paradas.map<ParadaVista>((parada) => {
    const terminal =
      parada.tipo === 'terminal'
        ? datos.terminales.find(
            (candidata) => candidata.id === parada.terminalId,
          )
        : undefined;
    return {
      hora: new Date(llegadaEstimada(viaje, ruta, parada) ?? viaje.salida),
      nombre:
        parada.tipo === 'terminal' ? (terminal?.nombre ?? '') : parada.nombre,
      tipo: parada.tipo,
    };
  });

  return {
    chofer,
    distanciaKm: ruta.distanciaKm,
    duracionMin: ruta.duracionMin,
    llegada: new Date(
      new Date(viaje.salida).getTime() +
        (viaje.minutosAtraso + ruta.duracionMin) * 60_000,
    ),
    paradas,
    salida,
    unidad: {
      comodidades: bus.comodidades,
      cooperativa: bus.cooperativa,
      placa: bus.placa,
      plazas: asientosDe(bus.configuracion).length,
    },
  };
}
