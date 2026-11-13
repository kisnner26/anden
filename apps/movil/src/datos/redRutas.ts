import { CORREDORES_INICIALES, type CorredorInterlocal } from './corredores';

export type CiudadRed = 'Boaco' | 'Juigalpa';
/** ida: de Managua a la ciudad; vuelta: de la ciudad a Managua */
export type SentidoRed = 'ida' | 'vuelta';

export interface SeleccionRed {
  ciudad: CiudadRed;
  sentido: SentidoRed;
}

export const CIUDADES_RED: readonly CiudadRed[] = ['Boaco', 'Juigalpa'];

/** el corredor que corresponde a una ciudad y un sentido */
export function corredorDe({
  ciudad,
  sentido,
}: SeleccionRed): CorredorInterlocal {
  const corredor = CORREDORES_INICIALES.find((c) =>
    sentido === 'ida'
      ? c.origen === 'Managua' && c.destino === ciudad
      : c.origen === ciudad && c.destino === 'Managua',
  );
  if (!corredor) throw new Error(`no hay corredor para ${ciudad} ${sentido}`);
  return corredor;
}

export function seleccionDe(corredor: CorredorInterlocal): SeleccionRed {
  return corredor.origen === 'Managua'
    ? { ciudad: corredor.destino as CiudadRed, sentido: 'ida' }
    : { ciudad: corredor.origen as CiudadRed, sentido: 'vuelta' };
}

export function invertirSentido(seleccion: SeleccionRed): SeleccionRed {
  return {
    ciudad: seleccion.ciudad,
    sentido: seleccion.sentido === 'ida' ? 'vuelta' : 'ida',
  };
}
