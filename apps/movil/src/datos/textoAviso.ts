import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

import type { Aviso } from './avisos';

/** el titular y el detalle de un aviso, con sus datos puestos en el texto */
export function textoAviso(aviso: Aviso): { detalle: string; titulo: string } {
  const valores = {
    anden: aviso.anden,
    destino: aviso.destino,
    minutos: aviso.minutos,
  };
  return {
    detalle: rellenar(t(`avisos.${aviso.tipo}Detalle`), valores),
    titulo: rellenar(t(`avisos.${aviso.tipo}`), valores),
  };
}

/** el texto de la notificación local que se programa 30 minutos antes */
export function textoRecordatorio(destino: string, anden: number) {
  return {
    cuerpo: rellenar(t('avisos.recordatorioCuerpo'), { anden }),
    titulo: rellenar(t('avisos.recordatorioTitulo'), { destino }),
  };
}
