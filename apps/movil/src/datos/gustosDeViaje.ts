import type { TipoServicio } from '@anden/dominio';

import type { BoletoGuardado } from './reserva';

/** lo que el historial de boletos dice de cómo le gusta viajar a la persona; sale solo de sus boletos */
export interface GustosDeViaje {
  /** a qué hora suele salir, en minutos desde la medianoche; nulo con pocos viajes */
  horaPreferida: number | null;
  /** el servicio que más elige; nulo si no hay uno claro */
  servicio: TipoServicio | null;
  /** cuántos viajes sostienen estos gustos */
  viajes: number;
}

export const SIN_GUSTOS: GustosDeViaje = {
  horaPreferida: null,
  servicio: null,
  viajes: 0,
};

/** con menos viajes que esto no se saca ninguna conclusión */
export const VIAJES_MINIMOS = 2;

function minutosDelDia(fecha: Date): number {
  return fecha.getHours() * 60 + fecha.getMinutes();
}

/** el promedio de horas del día tratando el reloj como un círculo, para que 23:50 y 00:10 queden juntas */
function promedioCircular(minutos: readonly number[]): number {
  const vuelta = 24 * 60;
  let seno = 0;
  let coseno = 0;
  for (const m of minutos) {
    const angulo = (m / vuelta) * 2 * Math.PI;
    seno += Math.sin(angulo);
    coseno += Math.cos(angulo);
  }
  const angulo = Math.atan2(seno, coseno);
  return Math.round(((angulo / (2 * Math.PI)) * vuelta + vuelta) % vuelta);
}

/** los gustos de viaje de la persona a partir de los boletos que no canceló */
export function gustosDeViaje(
  boletos: readonly BoletoGuardado[],
): GustosDeViaje {
  const validos = boletos.filter(({ boleto }) => boleto.estado !== 'cancelado');
  if (validos.length < VIAJES_MINIMOS) {
    return { ...SIN_GUSTOS, viajes: validos.length };
  }
  const horas = validos.map(({ resumen }) =>
    minutosDelDia(new Date(resumen.salida)),
  );
  const cuenta = new Map<TipoServicio, number>();
  for (const { resumen } of validos) {
    cuenta.set(resumen.servicio, (cuenta.get(resumen.servicio) ?? 0) + 1);
  }
  const [primero, segundo] = [...cuenta.entries()].sort((a, b) => b[1] - a[1]);
  // solo cuenta como gusto si gana con claridad: más de la mitad y sin empate
  const claro =
    primero !== undefined &&
    primero[1] > validos.length / 2 &&
    primero[1] !== segundo?.[1];
  return {
    horaPreferida: promedioCircular(horas),
    servicio: claro ? primero[0] : null,
    viajes: validos.length,
  };
}
