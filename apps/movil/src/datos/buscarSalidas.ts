import { franjaHoraria, type Franja, type TipoServicio } from '@anden/dominio';

import type { Salida } from './salidas';

export interface FiltrosBusqueda {
  franja: Franja | null;
  servicio: TipoServicio | null;
  texto: string;
}

export const SIN_FILTROS: FiltrosBusqueda = {
  franja: null,
  servicio: null,
  texto: '',
};

/** minúsculas y sin tildes, para que "leon" encuentre "León" */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** las salidas que cumplen el texto (destino, código o placa), el servicio y la franja elegidos */
export function buscarSalidas(
  salidas: readonly Salida[],
  filtros: FiltrosBusqueda,
): Salida[] {
  const texto = normalizar(filtros.texto);
  return salidas.filter((salida) => {
    if (filtros.servicio && salida.servicio !== filtros.servicio) return false;
    if (filtros.franja && franjaHoraria(salida.salida) !== filtros.franja) {
      return false;
    }
    if (texto === '') return true;
    return [salida.destino, salida.codigoDestino, salida.placa].some((campo) =>
      normalizar(campo).includes(texto),
    );
  });
}

export function hayFiltros(filtros: FiltrosBusqueda): boolean {
  return (
    filtros.texto.trim() !== '' ||
    filtros.servicio !== null ||
    filtros.franja !== null
  );
}
