import type { Punto } from './busSimulado';
import { TRAZOS } from './trazos';

export interface TrazoEntreCiudades {
  distanciaKm: number;
  duracionMin: number;
  puntos: Punto[];
}

const CODIGO_POR_CIUDAD = { Boaco: 'boa', Juigalpa: 'jui' } as const;

/** el trazo de carretera entre Managua y otra ciudad, en el sentido pedido; nulo si no lo tenemos */
export function trazoEntre(
  ciudadOrigen: string,
  ciudadDestino: string,
): TrazoEntreCiudades | null {
  const haciaManagua = ciudadDestino === 'Managua';
  const otra = haciaManagua ? ciudadOrigen : ciudadDestino;
  if (!haciaManagua && ciudadOrigen !== 'Managua') return null;
  const codigo = CODIGO_POR_CIUDAD[otra as keyof typeof CODIGO_POR_CIUDAD];
  if (!codigo) return null;

  const trazo = TRAZOS[codigo];
  const puntos = trazo.puntos.map(([lat, lng]) => ({ lat, lng }));
  return {
    distanciaKm: trazo.distanciaKm,
    duracionMin: trazo.duracionMin,
    puntos: haciaManagua ? puntos.reverse() : puntos,
  };
}
