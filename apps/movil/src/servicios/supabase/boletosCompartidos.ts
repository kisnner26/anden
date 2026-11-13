import type { BoletoGuardado } from '@/datos/reserva';

import { obtenerCliente } from './cliente';

interface FilaBoleto {
  asiento: number;
  boleto_id: string;
  contenido: BoletoGuardado;
  estado: string;
  viaje_id: string;
}

function aFila(guardado: BoletoGuardado): FilaBoleto {
  return {
    asiento: guardado.boleto.asiento,
    boleto_id: guardado.boleto.id,
    contenido: guardado,
    estado: guardado.boleto.estado,
    viaje_id: guardado.boleto.viajeId,
  };
}

/** sube los boletos para que el conductor los vea; sin Supabase o sin sesión no hace nada */
export async function publicarBoletos(
  boletos: readonly BoletoGuardado[],
): Promise<boolean> {
  const cliente = obtenerCliente();
  if (!cliente || boletos.length === 0) return false;
  const { error } = await cliente
    .from('boletos')
    .upsert(boletos.map(aFila), { onConflict: 'boleto_id' });
  return error === null;
}

/** los boletos de un viaje tal como los subieron los pasajeros; vacío si no hay conexión */
export async function leerBoletosDelViaje(
  viajeId: string,
): Promise<BoletoGuardado[]> {
  const cliente = obtenerCliente();
  if (!cliente) return [];
  const { data, error } = await cliente
    .from('boletos')
    .select('contenido')
    .eq('viaje_id', viajeId);
  if (error || !data) return [];
  return data.map((fila) => (fila as { contenido: BoletoGuardado }).contenido);
}
