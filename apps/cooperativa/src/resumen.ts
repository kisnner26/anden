export interface Cierre {
  cobrado: number;
  pasajeros: number;
  pendiente: number;
  viaje_id: string;
}

export interface ViajeFila {
  anden: number;
  chofer_id: string;
  estado: string;
  id: string;
  placa: string;
  ruta_id: string;
  salida: string;
  salio_en: string | null;
  servicio: string;
}

export interface EncomiendaFila {
  chofer_id: string | null;
  estado: string;
  id: string;
  motivo: string | null;
  contenido: {
    codigo: string;
    descripcion: string;
    destino: string;
    origen: string;
    tamano: string;
  };
}

export interface AlertaFila {
  atendida: boolean;
  creada_en: string;
  id: string;
  lat: number | null;
  lng: number | null;
  nombre: string | null;
  tipo: string;
  viaje_id: string | null;
}

export interface ResumenCooperativa {
  alertasPendientes: number;
  cobrado: number;
  encomiendasAbiertas: number;
  pasajeros: number;
  porCobrar: number;
  viajesActivos: number;
  viajesCerrados: number;
}

const ABIERTAS = ['solicitada', 'aceptada', 'recibida'];

/** los números de la portada del panel, a partir de lo que hay en el servidor */
export function resumir(
  cierres: readonly Cierre[],
  viajes: readonly ViajeFila[],
  encomiendas: readonly EncomiendaFila[],
  alertas: readonly AlertaFila[],
): ResumenCooperativa {
  return {
    alertasPendientes: alertas.filter((a) => !a.atendida).length,
    cobrado: cierres.reduce((suma, c) => suma + c.cobrado, 0),
    encomiendasAbiertas: encomiendas.filter((e) => ABIERTAS.includes(e.estado))
      .length,
    pasajeros: cierres.reduce((suma, c) => suma + c.pasajeros, 0),
    porCobrar: cierres.reduce((suma, c) => suma + c.pendiente, 0),
    viajesActivos: viajes.filter((v) => v.estado !== 'cancelado' && !v.salio_en)
      .length,
    viajesCerrados: cierres.length,
  };
}

/** cuánto se espera en promedio hasta que un bus sale, en minutos; nulo sin viajes que ya hayan salido */
export function esperaPromedio(viajes: readonly ViajeFila[]): number | null {
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
