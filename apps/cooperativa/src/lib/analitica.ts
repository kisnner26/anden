import { corredorDe, ocupacion } from './ruta';
import type {
  Alerta,
  Boleto,
  Cierre,
  Datos,
  Encomienda,
  Viaje,
} from '../tipos';

const ABIERTAS = ['solicitada', 'aceptada', 'recibida'];

export function vendidosDe(
  boletos: readonly Boleto[],
  viajeId: string,
): number {
  return boletos.filter(
    (b) => b.viaje_id === viajeId && b.estado !== 'cancelado',
  ).length;
}

export function esperaPromedio(viajes: readonly Viaje[]): number | null {
  const salidos = viajes.filter((v) => v.salio_en);
  if (salidos.length === 0) return null;
  const total = salidos.reduce(
    (suma, v) =>
      suma +
      (new Date(v.salio_en as string).getTime() -
        new Date(v.salida).getTime()) /
        60_000,
    0,
  );
  return Math.round(total / salidos.length);
}

export interface Resumen {
  alertasPendientes: number;
  cobrado: number;
  encomiendasAbiertas: number;
  ocupacionMedia: number;
  pasajeros: number;
  porCobrar: number;
  viajesActivos: number;
  viajesCerrados: number;
}

/** los números de la portada a partir de lo que hay en el servidor */
export function resumir(
  d: Pick<Datos, 'alertas' | 'boletos' | 'cierres' | 'encomiendas' | 'viajes'>,
): Resumen {
  const activos = d.viajes.filter(
    (v) => v.estado !== 'cancelado' && !v.salio_en,
  );
  const fracciones = activos.map(
    (v) => ocupacion(vendidosDe(d.boletos, v.id), v.servicio).fraccion,
  );
  return {
    alertasPendientes: d.alertas.filter((a) => !a.atendida).length,
    cobrado: d.cierres.reduce((suma, c) => suma + c.cobrado, 0),
    encomiendasAbiertas: d.encomiendas.filter((e) =>
      ABIERTAS.includes(e.estado),
    ).length,
    ocupacionMedia:
      fracciones.length === 0
        ? 0
        : fracciones.reduce((a, b) => a + b, 0) / fracciones.length,
    pasajeros: d.cierres.reduce((suma, c) => suma + c.pasajeros, 0),
    porCobrar: d.cierres.reduce((suma, c) => suma + c.pendiente, 0),
    viajesActivos: activos.length,
    viajesCerrados: d.cierres.length,
  };
}

/** lo cobrado en cada uno de los últimos `dias` días, del más viejo al de hoy */
export function cobradoPorDia(
  cierres: readonly Cierre[],
  dias: number,
  hoy: Date = new Date(),
): { dia: string; total: number }[] {
  const lista = Array.from({ length: dias }, (_, i) => {
    const d = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() - (dias - 1 - i),
    );
    return { dia: d.toDateString(), total: 0 };
  });
  for (const c of cierres) {
    const celda = lista.find(
      (l) => l.dia === new Date(c.cerrado_en).toDateString(),
    );
    if (celda) celda.total += c.cobrado;
  }
  return lista;
}

/** cuánto cobró cada conductor, de mayor a menor */
export function rankingDeConductores(
  cierres: readonly Cierre[],
): { chofer: string; cobrado: number; pasajeros: number; viajes: number }[] {
  const mapa = new Map<
    string,
    { chofer: string; cobrado: number; pasajeros: number; viajes: number }
  >();
  for (const c of cierres) {
    const actual = mapa.get(c.chofer_id) ?? {
      chofer: c.chofer_id,
      cobrado: 0,
      pasajeros: 0,
      viajes: 0,
    };
    actual.cobrado += c.cobrado;
    actual.pasajeros += c.pasajeros;
    actual.viajes += 1;
    mapa.set(c.chofer_id, actual);
  }
  return [...mapa.values()].sort((a, b) => b.cobrado - a.cobrado);
}

export interface Evento {
  detalle: string;
  hora: string;
  tipo: 'alerta' | 'boleto' | 'cierre' | 'encomienda' | 'viaje';
  titulo: string;
}

/** una línea de tiempo con lo último que pasó en toda la red, mezclando viajes, boletos, cierres, encomiendas y alertas */
export function lineaDeTiempo(
  d: Pick<Datos, 'alertas' | 'boletos' | 'cierres' | 'encomiendas' | 'viajes'>,
  limite = 40,
): Evento[] {
  const eventos: Evento[] = [
    ...d.alertas.map<Evento>((a) => ({
      detalle: `${a.nombre ?? 'Una persona'} no respondió tras un posible choque`,
      hora: a.creada_en,
      tipo: 'alerta',
      titulo: a.atendida ? 'Alerta atendida' : 'Alerta de seguridad',
    })),
    ...d.boletos.map<Evento>((b) => ({
      detalle: `${b.contenido?.boleto?.pasajero?.nombre ?? 'Pasajero'} · asiento ${b.asiento} a ${b.contenido?.resumen?.destino ?? '—'}`,
      hora: b.actualizado_en,
      tipo: 'boleto',
      titulo:
        b.estado === 'cancelado' ? 'Boleto cancelado' : 'Boleto reservado',
    })),
    ...d.cierres.map<Evento>((c) => ({
      detalle: `${c.chofer_id} cobró C$ ${c.cobrado} de ${c.pasajeros} pasajeros`,
      hora: c.cerrado_en,
      tipo: 'cierre',
      titulo: 'Viaje cerrado',
    })),
    ...d.encomiendas.map<Evento>((e) => ({
      detalle: `${e.contenido.codigo} · ${e.contenido.origen} → ${e.contenido.destino}`,
      hora: e.actualizada_en,
      tipo: 'encomienda',
      titulo: `Encomienda ${e.estado}`,
    })),
    ...d.viajes.map<Evento>((v) => ({
      detalle: `${v.placa} · punto ${v.punto_encuentro ?? 'por confirmar'} · ${v.chofer_id}`,
      hora: v.salio_en ?? v.salida,
      tipo: 'viaje',
      titulo:
        v.estado === 'cancelado'
          ? 'Viaje cancelado'
          : v.salio_en
            ? 'Bus salió'
            : 'Esperando pasajeros',
    })),
  ];
  return eventos.sort((a, b) => b.hora.localeCompare(a.hora)).slice(0, limite);
}

/** cuántos viajes hay por corredor, para el reparto en Finanzas y el Tablero */
export function viajesPorCorredor(viajes: readonly Viaje[]): {
  boaco: number;
  juigalpa: number;
} {
  return {
    boaco: viajes.filter((v) => corredorDe(v.ruta_id) === 'boaco').length,
    juigalpa: viajes.filter((v) => corredorDe(v.ruta_id) === 'juigalpa').length,
  };
}

export type { Alerta, Encomienda };
