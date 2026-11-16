import type { GustosDeViaje } from './gustosDeViaje';
import type { CuandoPedido } from './ordenesIA';
import type { Salida } from './salidas';

/** el bus tiene que dejar este margen para llegar a la terminal */
export const MARGEN_PARA_LLEGAR_MIN = 10;

const PENDIENTES = ['abordando', 'atrasado', 'programado'];

export interface ContextoDeEleccion {
  ahora: Date;
  /** lo que la persona pidió sobre cuándo viajar; manda sobre los gustos */
  cuando?: CuandoPedido | null;
  gustos?: GustosDeViaje | null;
}

export interface SalidaElegida {
  /** por qué conviene, en frases cortas para decírselo a la persona */
  motivos: string[];
  puntos: number;
  salida: Salida;
}

function horaReal(salida: Salida): number {
  return salida.salida.getTime() + salida.minutosAtraso * 60_000;
}

/** la salida se puede tomar: venta abierta, con asientos, sin salir ya y con margen para llegar */
export function esTomable(salida: Salida, ahora: Date): boolean {
  return (
    salida.ventaAbierta &&
    salida.asientosLibres > 0 &&
    PENDIENTES.includes(salida.estado) &&
    horaReal(salida) - ahora.getTime() >= MARGEN_PARA_LLEGAR_MIN * 60_000
  );
}

const RANGOS: Record<NonNullable<CuandoPedido['franja']>, [number, number]> = {
  madrugada: [0, 6],
  manana: [6, 12],
  noche: [18, 24],
  tarde: [12, 18],
  temprano: [3, 9],
};

/** la salida respeta lo que la persona pidió sobre la hora */
function cumpleLoPedido(salida: Salida, cuando: CuandoPedido | null): boolean {
  if (!cuando) return true;
  const hora = salida.salida.getHours();
  if (cuando.hora !== null && hora !== cuando.hora) return false;
  if (cuando.franja) {
    const [desde, hasta] = RANGOS[cuando.franja];
    if (hora < desde || hora >= hasta) return false;
  }
  return true;
}

function distanciaEnElReloj(a: number, b: number): number {
  const vuelta = 24 * 60;
  const d = Math.abs(a - b) % vuelta;
  return Math.min(d, vuelta - d);
}

/**
 * la salida que más le conviene a la persona entre las de un mismo trayecto: la que sale pronto pero
 * con margen, sin atraso, barata, con asientos y a su hora y servicio de siempre. Devuelve también
 * por qué, para que el asistente lo explique en vez de inventarlo.
 */
export function mejorSalida(
  salidas: readonly Salida[],
  { ahora, cuando = null, gustos = null }: ContextoDeEleccion,
): SalidaElegida | null {
  const tomables = salidas.filter((s) => esTomable(s, ahora));
  if (tomables.length === 0) return null;
  // lo pedido manda: si ninguna lo cumple, se elige entre todas en vez de quedarse sin respuesta
  const pedidas = tomables.filter((s) => cumpleLoPedido(s, cuando));
  const candidatas = pedidas.length > 0 ? pedidas : tomables;
  const tarifas = candidatas
    .map((s) => s.tarifa)
    .filter((t): t is number => t !== null);
  const minimo = tarifas.length > 0 ? Math.min(...tarifas) : null;

  let mejor: SalidaElegida | null = null;
  for (const salida of candidatas) {
    const motivos: string[] = [];
    let puntos = 100;
    const espera = (horaReal(salida) - ahora.getTime()) / 60_000;
    puntos -= Math.min(espera / 10, 40);
    if (espera <= 60) motivos.push('sale pronto');
    if (salida.minutosAtraso > 0) {
      puntos -= Math.min(salida.minutosAtraso * 0.8, 30);
    } else if (candidatas.some((s) => s.minutosAtraso > 0)) {
      motivos.push('sale a tiempo');
    }
    if (salida.tarifa === null) puntos -= 25;
    else if (minimo !== null && minimo > 0) {
      puntos -= ((salida.tarifa - minimo) / minimo) * 40;
      if (salida.tarifa === minimo && tarifas.some((t) => t > minimo)) {
        motivos.push('es la más barata');
      }
    }
    if (salida.servicio === 'expreso') {
      puntos += 6;
      motivos.push('es expreso, llega antes');
    }
    if (salida.asientosLibres <= 2) puntos -= 8;
    else if (salida.asientosLibres >= 10) puntos += 2;
    if (gustos?.horaPreferida != null) {
      const minutos =
        salida.salida.getHours() * 60 + salida.salida.getMinutes();
      const cerca = Math.max(
        0,
        1 - distanciaEnElReloj(minutos, gustos.horaPreferida) / 120,
      );
      puntos += 15 * cerca;
      if (cerca >= 0.75) motivos.push('es a la hora que suele viajar');
    }
    if (gustos?.servicio && gustos.servicio === salida.servicio) {
      puntos += 8;
      motivos.push(`es ${salida.servicio}, como suele elegir`);
    }
    if (!mejor || puntos > mejor.puntos) mejor = { motivos, puntos, salida };
  }
  return mejor;
}
