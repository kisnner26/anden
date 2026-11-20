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
