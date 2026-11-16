import type { Coordenada } from './geometria';
import { formatoHoraCompleta } from './formato';
import { MINUTOS_EN_EL_ANDEN } from './planViaje';
import type { BoletoGuardado } from './reserva';
import { ladoDelSolEnViaje } from './solEnViaje';
import { trazoEntre } from './trazoCorredor';

export interface TerminalConCoordenadas {
  ciudad: string;
  coordenadas: Coordenada;
}

/**
 * lo que sirve saber de un viaje que viene: a qué hora estar en el punto de encuentro, cuándo llega y de qué lado
 * pega el sol. Son cuentas de la app; así el asistente las dice en vez de calcularlas a ojo.
 */
export function consejoDeViaje(
  { resumen }: BoletoGuardado,
  terminales: readonly TerminalConCoordenadas[],
): string[] {
  const salida = new Date(resumen.salida);
  const origen = resumen.origen ?? 'Managua';
  const lineas: string[] = [];
  const anden = new Date(salida.getTime() - MINUTOS_EN_EL_ANDEN * 60_000);
  const trazo = trazoEntre(origen, resumen.destino);
  lineas.push(
    `Para su viaje a ${resumen.destino}: estar en el punto de encuentro a las ${formatoHoraCompleta(anden)}, el bus sale a las ${formatoHoraCompleta(salida)}${
      trazo
        ? ` y llega más o menos a las ${formatoHoraCompleta(new Date(salida.getTime() + trazo.duracionMin * 60_000))} (${Math.round(trazo.distanciaKm)} km, unos ${trazo.duracionMin} min)`
        : ''
    }.`,
  );
  const desde = terminales.find((t) => t.ciudad === origen);
  const hasta = terminales.find((t) => t.ciudad === resumen.destino);
  if (desde && hasta) {
    const lado = ladoDelSolEnViaje(
      salida,
      desde.coordenadas,
      hasta.coordenadas,
      trazo?.duracionMin,
    );
    lineas.push(
      lado === 'ninguno'
        ? 'En ese viaje el sol no molesta de un lado en particular.'
        : `En ese viaje el sol pega del lado ${lado === 'derecha' ? 'derecho' : 'izquierdo'} del bus: si quiere sombra, que elija asiento del otro lado.`,
    );
  }
  return lineas;
}
