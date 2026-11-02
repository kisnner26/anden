import type { EstadoViaje, Parada, Ruta, Viaje } from './tipos';

const MINUTOS_ABORDAJE = 20;
const MINUTOS_CIERRE_VENTA = 15;

function sumarMinutos(fecha: string, minutos: number): Date {
  return new Date(new Date(fecha).getTime() + minutos * 60_000);
}

function salidaReal(viaje: Viaje): Date {
  return sumarMinutos(viaje.salida, viaje.minutosAtraso);
}

export function estadoViaje(
  viaje: Viaje,
  ruta: Ruta,
  ahora: Date,
): EstadoViaje {
  if (viaje.estado === 'cancelado') return 'cancelado';

  const salida = salidaReal(viaje);
  const llegada = sumarMinutos(salida.toISOString(), ruta.duracionMin);
  if (ahora >= llegada) return 'llego';
  if (ahora >= salida) return 'en-ruta';
  if (viaje.minutosAtraso > 0) return 'atrasado';
  if (ahora >= sumarMinutos(salida.toISOString(), -MINUTOS_ABORDAJE)) {
    return 'abordando';
  }
  return 'programado';
}

export function llegadaEstimada(
  viaje: Viaje,
  ruta: Ruta,
  parada: Parada,
): string | null {
  if (!ruta.paradas.includes(parada)) return null;
  return sumarMinutos(
    viaje.salida,
    viaje.minutosAtraso + parada.minutosDesdeOrigen,
  ).toISOString();
}

export function ventaAbierta(viaje: Viaje, ahora: Date): boolean {
  if (viaje.estado === 'cancelado') return false;
  return ahora < sumarMinutos(viaje.salida, -MINUTOS_CIERRE_VENTA);
}
