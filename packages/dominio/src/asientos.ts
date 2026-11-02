import { asientosDe } from './configuraciones';
import { ventaAbierta } from './horarios';
import { error, ok, type Resultado } from './resultado';
import type { ConfiguracionBus, Ocupacion, Viaje } from './tipos';

export type EstadoAsiento = 'libre' | 'retenido' | 'vendido';

export function estadoAsientos(
  configuracion: ConfiguracionBus,
  ocupaciones: Ocupacion[],
  ahora: Date,
): { numero: number; estado: EstadoAsiento; duenoId?: string }[] {
  const vigentes = new Map<number, Ocupacion>();
  for (const ocupacion of ocupaciones) {
    if (ocupacion.estado === 'retenido' && new Date(ocupacion.expira) <= ahora)
      continue;
    vigentes.set(ocupacion.asiento, ocupacion);
  }
  return asientosDe(configuracion).map((asiento) => {
    const ocupacion = vigentes.get(asiento.numero);
    if (!ocupacion) return { numero: asiento.numero, estado: 'libre' };
    return {
      numero: asiento.numero,
      estado: ocupacion.estado,
      duenoId: ocupacion.duenoId,
    };
  });
}

export function puedeRetener(
  viaje: Viaje,
  configuracion: ConfiguracionBus,
  ocupaciones: Ocupacion[],
  asientos: number[],
  duenoId: string,
  ahora: Date,
): Resultado<
  void,
  | 'sin-asientos'
  | 'maximo-6'
  | 'asiento-inexistente'
  | 'asiento-ocupado'
  | 'venta-cerrada'
> {
  if (!ventaAbierta(viaje, ahora)) return error('venta-cerrada');
  if (asientos.length === 0) return error('sin-asientos');
  if (asientos.length > 6) return error('maximo-6');
  const disponibles = estadoAsientos(configuracion, ocupaciones, ahora);
  for (const numero of asientos) {
    const asiento = disponibles.find(
      (candidato) => candidato.numero === numero,
    );
    if (!asiento) return error('asiento-inexistente');
    if (asiento.estado !== 'libre' && asiento.duenoId !== duenoId)
      return error('asiento-ocupado');
  }
  return ok(undefined);
}
