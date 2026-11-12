import type { BoletoGuardado } from './reserva';

export interface ViajesAUnDestino {
  /** del más reciente al más antiguo */
  boletos: BoletoGuardado[];
  destino: string;
}

/** los viajes ya hechos agrupados por destino: el más recorrido primero y, a igual cuenta, el más reciente */
export function agruparPorDestino(
  boletos: readonly BoletoGuardado[],
): ViajesAUnDestino[] {
  const hora = (b: BoletoGuardado) => new Date(b.resumen.salida).getTime();
  const grupos = new Map<string, BoletoGuardado[]>();
  for (const guardado of boletos) {
    const lista = grupos.get(guardado.resumen.destino) ?? [];
    lista.push(guardado);
    grupos.set(guardado.resumen.destino, lista);
  }
  return [...grupos.entries()]
    .map(([destino, lista]) => ({
      boletos: [...lista].sort((a, b) => hora(b) - hora(a)),
      destino,
    }))
    .sort(
      (a, b) =>
        b.boletos.length - a.boletos.length ||
        hora(b.boletos[0]!) - hora(a.boletos[0]!),
    );
}
