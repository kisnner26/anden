import type { BoletoGuardado } from './reserva';
import { trazoEntre } from './trazoCorredor';

export interface ResumenViajes {
  /** el destino al que más se viajó; nulo sin viajes */
  destinoFavorito: string | null;
  gastado: number;
  /** kilómetros de carretera de todos los viajes con trazo conocido */
  kilometros: number;
  /** el mes con más viajes, de 0 a 11; nulo sin viajes */
  mesTop: number | null;
  viajes: number;
}

/** la ciudad que no es Managua del trayecto, que es la que tiene el trazo */
function otraCiudad(guardado: BoletoGuardado): string | null {
  const { destino, origen } = guardado.resumen;
  if (destino !== 'Managua') return destino;
  // los boletos guardan el nombre de la terminal; la ciudad es su primera palabra conocida
  if (origen?.includes('Boaco')) return 'Boaco';
  if (origen?.includes('Juigalpa')) return 'Juigalpa';
  return null;
}

/** lo que se puede contar de los viajes ya hechos; los cancelados no cuentan */
export function resumenDeViajes(
  boletos: readonly BoletoGuardado[],
): ResumenViajes {
  const validos = boletos.filter((b) => b.boleto.estado !== 'cancelado');
  const porDestino = new Map<string, number>();
  const porMes = new Map<number, number>();
  let kilometros = 0;
  let gastado = 0;

  for (const guardado of validos) {
    gastado += guardado.boleto.precio;
    const destino = guardado.resumen.destino;
    porDestino.set(destino, (porDestino.get(destino) ?? 0) + 1);
    const mes = new Date(guardado.resumen.salida).getMonth();
    porMes.set(mes, (porMes.get(mes) ?? 0) + 1);
    const ciudad = otraCiudad(guardado);
    const trazo = ciudad ? trazoEntre('Managua', ciudad) : null;
    if (trazo) kilometros += trazo.distanciaKm;
  }

  const mayor = <T>(mapa: Map<T, number>): T | null =>
    [...mapa.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    destinoFavorito: mayor(porDestino),
    gastado,
    kilometros: Math.round(kilometros),
    mesTop: mayor(porMes),
    viajes: validos.length,
  };
}
