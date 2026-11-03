import {
  estadoAsientos,
  estadoViaje,
  precioOficial,
  ventaAbierta,
  type EstadoViaje,
  type TipoServicio,
} from '@anden/dominio';

import type { DatosMuestra } from './muestra';

export interface Salida {
  anden: number;
  choferId: string;
  asientosLibres: number;
  codigoDestino: string;
  destino: string;
  estado: EstadoViaje;
  minutosAtraso: number;
  /** placa de la unidad, que en el taxi interlocal es lo que identifica el carro */
  placa: string;
  rutaId: string;
  salida: Date;
  servicio: TipoServicio;
  /** córdobas por pasajero; nulo si la ruta no tiene tarifa cargada */
  tarifa: number | null;
  ventaAbierta: boolean;
  viajeId: string;
}

const PASAJERO = { esMenorEnBrazos: false, nombre: 'pasajero' } as const;
const ESTADOS_PENDIENTES: EstadoViaje[] = [
  'abordando',
  'atrasado',
  'programado',
];

/** las salidas de la terminal de origen con su estado, tarifa y asientos libres, ordenadas por hora */
export function armarSalidas(
  datos: DatosMuestra,
  ahora: Date,
  origenId: string = 'ter_uca',
): Salida[] {
  const salidas: Salida[] = [];

  for (const viaje of datos.viajes) {
    const ruta = datos.rutas.find((candidata) => candidata.id === viaje.rutaId);
    const bus = datos.buses.find((candidato) => candidato.id === viaje.busId);
    const destino = datos.terminales.find(
      (terminal) => terminal.id === ruta?.destinoId,
    );
    if (!ruta || !bus || !destino || ruta.origenId !== origenId) continue;

    const precio = precioOficial(
      datos.tarifario,
      ruta.id,
      bus.servicio,
      { desde: 0, hasta: ruta.paradas.length - 1 },
      [PASAJERO],
    );
    const ocupaciones = datos.ocupaciones.filter(
      (ocupacion) => ocupacion.viajeId === viaje.id,
    );
    const asientosLibres = estadoAsientos(
      bus.configuracion,
      ocupaciones,
      ahora,
    ).filter((asiento) => asiento.estado === 'libre').length;

    salidas.push({
      anden: viaje.anden,
      asientosLibres,
      choferId: viaje.choferId,
      codigoDestino: destino.codigo,
      destino: destino.ciudad,
      estado: estadoViaje(viaje, ruta, ahora),
      minutosAtraso: viaje.minutosAtraso,
      placa: bus.placa,
      rutaId: ruta.id,
      salida: new Date(viaje.salida),
      servicio: bus.servicio,
      tarifa: precio.ok ? precio.valor.unitario : null,
      ventaAbierta: ventaAbierta(viaje, ahora),
      viajeId: viaje.id,
    });
  }

  return salidas.sort((a, b) => a.salida.getTime() - b.salida.getTime());
}

/** la próxima salida que todavía no partió, con el atraso incluido */
export function proximaSalida(salidas: Salida[]): Salida | null {
  const pendientes = salidas
    .filter((salida) => ESTADOS_PENDIENTES.includes(salida.estado))
    .sort(
      (a, b) =>
        a.salida.getTime() +
        a.minutosAtraso * 60_000 -
        (b.salida.getTime() + b.minutosAtraso * 60_000),
    );
  return pendientes[0] ?? null;
}
