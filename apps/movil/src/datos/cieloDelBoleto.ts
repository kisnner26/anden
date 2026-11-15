import type { Coordenada } from './geometria';
import type { DatosMuestra } from './muestra';
import type { BoletoGuardado } from './reserva';
import { trazoEntre } from './trazoCorredor';

/** de dónde sale el boleto y cuánto dura el viaje, para pintar el cielo del trayecto; nulo si no se conoce la terminal */
export function datosDelCielo(
  guardado: BoletoGuardado,
  terminales: DatosMuestra['terminales'],
): { duracionMin: number; lugar: Coordenada } | null {
  const origen = guardado.resumen.origen;
  const salida = terminales.find((t) =>
    origen === undefined
      ? // los boletos viejos no guardaron la terminal: si no van a Managua, salen de Managua
        guardado.resumen.destino !== 'Managua' && t.ciudad === 'Managua'
      : t.nombre === origen || t.ciudad === origen,
  );
  if (!salida) return null;
  const trazo = trazoEntre(salida.ciudad, guardado.resumen.destino);
  return {
    duracionMin: trazo?.duracionMin ?? 120,
    lugar: salida.coordenadas,
  };
}
