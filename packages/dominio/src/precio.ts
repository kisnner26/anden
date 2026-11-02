import type { Ruta, TipoBus, Tramo } from './tipos';

export const MULTIPLICADORES_BUS: Record<TipoBus, number> = {
  ordinario: 1,
  interlocal: 1.2,
  expreso: 1.5,
};

function esTramoValido(ruta: Ruta, tramo: Tramo): boolean {
  return (
    Number.isInteger(tramo.desde) &&
    Number.isInteger(tramo.hasta) &&
    tramo.desde >= 0 &&
    tramo.desde < tramo.hasta &&
    tramo.hasta < ruta.paradas.length
  );
}

/** minutos que tarda el bus entre las dos paradas del tramo */
export function minutosDelTramo(ruta: Ruta, tramo: Tramo): number | null {
  if (!esTramoValido(ruta, tramo)) return null;

  const salida = ruta.paradas[tramo.desde];
  const llegada = ruta.paradas[tramo.hasta];
  if (!salida || !llegada) return null;
  return llegada.minutosDesdeOrigen - salida.minutosDesdeOrigen;
}
