import { formatoHoraCompleta } from './formato';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface EntradaLineaDelMomento {
  ahora: Date;
  /** el destino al que más viaja la persona, si ya se conoce */
  habitual: string | null;
  /** la próxima salida que le sirve, si hay */
  proxima: { destino: string; salida: Date } | null;
  /** destino del boleto vigente más cercano, si tiene uno */
  boletoProximo: { destino: string; salida: Date } | null;
}

/**
 * la línea que acompaña el saludo: se arma sola con lo que se sabe de la persona, sin que pregunte. Primero
 * su boleto de hoy, luego la salida de su destino de siempre, y si no, un saludo según la hora del día
 */
export function lineaDelMomento({
  ahora,
  boletoProximo,
  habitual,
  proxima,
}: EntradaLineaDelMomento): string {
  const mismoDia = (fecha: Date) =>
    fecha.toDateString() === ahora.toDateString() &&
    fecha.getTime() > ahora.getTime();
  if (boletoProximo && mismoDia(boletoProximo.salida)) {
    return rellenar(t('viajar.lineaBoleto'), {
      destino: boletoProximo.destino,
      hora: formatoHoraCompleta(boletoProximo.salida),
    });
  }
  if (
    habitual &&
    proxima &&
    proxima.destino.toLowerCase() === habitual.toLowerCase()
  ) {
    return rellenar(t('viajar.lineaHabitual'), {
      destino: proxima.destino,
      hora: formatoHoraCompleta(proxima.salida),
    });
  }
  const hora = ahora.getHours();
  if (hora < 5) return t('viajar.lineaMadrugada');
  if (hora < 12) return t('viajar.lineaManana');
  if (hora < 19) return t('viajar.lineaTarde');
  return t('viajar.lineaNoche');
}
