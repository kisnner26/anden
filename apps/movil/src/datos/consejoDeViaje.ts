import type { Coordenada } from './geometria';
import type { GustosDeViaje } from './gustosDeViaje';
import { mejorSalida } from './mejorSalida';
import type { Salida } from './salidas';
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

/** a partir de cuántos minutos de atraso se avisa y se ofrece otra salida */
export const ATRASO_QUE_SE_AVISA_MIN = 10;

/**
 * si el bus del boleto se atrasó o se canceló, lo dice y propone la salida que más conviene del mismo
 * trayecto; vacío si el viaje va normal
 */
export function avisoDeAlteracion(
  { boleto, resumen }: BoletoGuardado,
  salidas: readonly Salida[],
  ahora: Date,
  gustos: GustosDeViaje | null,
): string[] {
  const propia = salidas.find((s) => s.viajeId === boleto.viajeId);
  if (!propia) return [];
  const cancelado = propia.estado === 'cancelado';
  if (!cancelado && propia.minutosAtraso < ATRASO_QUE_SE_AVISA_MIN) return [];
  const lineas = [
    cancelado
      ? `Atención: el bus de su boleto a ${resumen.destino} fue cancelado.`
      : `Atención: el bus de su boleto a ${resumen.destino} lleva ${propia.minutosAtraso} minutos de atraso.`,
  ];
  const otras = salidas.filter(
    (s) =>
      s.viajeId !== propia.viajeId &&
      s.origen === propia.origen &&
      s.destino === propia.destino,
  );
  const alternativa = mejorSalida(otras, { ahora, gustos });
  if (alternativa) {
    const { salida, motivos } = alternativa;
    lineas.push(
      `La salida que más le conviene como alternativa: ${formatoHoraCompleta(salida.salida)}, ${
        salida.tarifa === null ? 'sin tarifa cargada' : `C$ ${salida.tarifa}`
      }, ${salida.asientosLibres} asientos libres${motivos.length > 0 ? ` (${motivos.join(', ')})` : ''}.`,
    );
  }
  return lineas;
}
