import type { TipoServicio } from '@anden/dominio';

/** cómo se rotula el servicio en el boleto de papel de la cooperativa */
export function rotuloDelServicio(servicio: TipoServicio): string {
  return servicio === 'expreso' ? 'Expreso interlocal' : 'Ordinario interlocal';
}
