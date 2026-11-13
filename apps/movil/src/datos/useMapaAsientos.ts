import {
  asientosDe,
  estadoAsientos,
  PLANOS,
  type Asiento,
  type ConfiguracionBus,
  type EstadoAsiento,
  type Plano,
} from '@anden/dominio';
import { useMemo } from 'react';

import { useAhora, useSalidas } from './useSalidas';

export interface MapaAsientosViaje {
  asientos: Asiento[];
  configuracion: ConfiguracionBus;
  estados: Map<number, EstadoAsiento>;
  plano: Plano;
  tarifa: number | null;
}

/** el plano del bus de un viaje con el estado de cada asiento; nulo si el viaje no existe */
export function useMapaAsientos(
  viajeId: string,
  version = 0,
): MapaAsientosViaje | null {
  const ahora = useAhora();
  const { datos, salidas } = useSalidas();

  return useMemo(() => {
    const viaje = datos.viajes.find((candidato) => candidato.id === viajeId);
    const bus = datos.buses.find((candidato) => candidato.id === viaje?.busId);
    if (!viaje || !bus) return null;

    const ocupaciones = datos.ocupaciones.filter(
      (ocupacion) => ocupacion.viajeId === viaje.id,
    );
    const estados = new Map(
      estadoAsientos(bus.configuracion, ocupaciones, ahora).map(
        (asiento) => [asiento.numero, asiento.estado] as const,
      ),
    );
    return {
      asientos: asientosDe(bus.configuracion),
      configuracion: bus.configuracion,
      estados,
      plano: PLANOS[bus.configuracion],
      tarifa:
        salidas.find((salida) => salida.viajeId === viaje.id)?.tarifa ?? null,
    };
    // `version` cambia cuando llegan asientos vendidos por otros teléfonos
  }, [ahora, datos, salidas, version, viajeId]);
}
