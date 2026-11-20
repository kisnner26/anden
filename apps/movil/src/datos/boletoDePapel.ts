import type { TipoServicio } from '@anden/dominio';

/** cómo se rotula el servicio en el boleto de papel de la cooperativa */
export function rotuloDelServicio(servicio: TipoServicio): string {
  return servicio === 'expreso' ? 'Expreso interlocal' : 'Ordinario interlocal';
}

/** el trayecto como lo imprime la cooperativa, en mayúsculas y con raya: BOACO-MANAGUA; sin terminal de origen, solo el destino */
export function trayectoImpreso(
  origen: string | undefined,
  destino: string,
): string {
  const partes = origen ? [origen, destino] : [destino];
  return partes.map((parte) => parte.trim().toUpperCase()).join('–');
}

export interface TelefonoDeCooperativa {
  numero: string;
  operador: 'Claro' | 'Tigo';
}

export interface ContactoDeCooperativa {
  /** frase corta al pie, como la bendición con la que cierran muchos boletos */
  cierre: string;
  /** avisos al pie del boleto */
  leyendas: readonly string[];
  telefonos: readonly TelefonoDeCooperativa[];
}

/**
 * lo que la cooperativa imprime en su boleto de papel: teléfonos de información y leyendas. Hoy es la cooperativa de
 * muestra; cuando cada cooperativa publique sus datos se leerán del servidor
 */
export function contactoDeCooperativa(
  cooperativa: string,
): ContactoDeCooperativa {
  void cooperativa;
  return {
    cierre: 'Bendición de Dios',
    leyendas: [
      'Se hacen viajes de turismo dentro y fuera del país',
      'Pagás al subir. Reportá objetos olvidados desde Andén',
    ],
    telefonos: [
      { numero: '8000-0001', operador: 'Claro' },
      { numero: '8000-0002', operador: 'Tigo' },
    ],
  };
}
