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

/** lo que pasó al subir los boletos: los que chocaron con un asiento ya vendido y los que no llegaron */
export interface ResultadoPublicacion {
  conflictos: string[];
  fallidos: string[];
}

/** el código de Postgres para una restricción de unicidad: el asiento ya lo vendió otro boleto */
const CODIGO_DUPLICADO = '23505';

/**
 * sube cada boleto por separado para que el conductor los vea: si uno choca con un asiento ya
 * vendido, los demás igual llegan. Sin Supabase o sin sesión no hace nada.
 */
export async function publicarBoletos(
  boletos: readonly BoletoGuardado[],
): Promise<ResultadoPublicacion> {
  const resultado: ResultadoPublicacion = { conflictos: [], fallidos: [] };
  const cliente = obtenerCliente();
  if (!cliente || boletos.length === 0) return resultado;
  await Promise.all(
    boletos.map(async (guardado) => {
      try {
        const { error } = await cliente
          .from('boletos')
          .upsert(aFila(guardado), { onConflict: 'boleto_id' });
        if (error === null) return;
        if (error.code === CODIGO_DUPLICADO) {
          resultado.conflictos.push(guardado.boleto.id);
        } else resultado.fallidos.push(guardado.boleto.id);
      } catch {
        resultado.fallidos.push(guardado.boleto.id);
      }
    }),
  );
  return resultado;
}

/** los asientos de un viaje que ya vendió cualquier teléfono; nulo si no hay servidor o no respondió */
export async function leerAsientosOcupados(
  viajeId: string,
): Promise<number[] | null> {
  const cliente = obtenerCliente();
  if (!cliente) return null;
  try {
    const { data, error } = await cliente.rpc('asientos_ocupados', {
      p_viaje: viajeId,
    });
    if (error || !Array.isArray(data)) return null;
    return data.filter((valor): valor is number => typeof valor === 'number');
  } catch {
    return null;
  }
}

/** los boletos de un viaje tal como los subieron los pasajeros; nulo si el servidor no respondió */
export async function leerBoletosDelViaje(
  viajeId: string,
): Promise<BoletoGuardado[] | null> {
  const cliente = obtenerCliente();
  // sin Supabase no hay nada compartido que traer, y no es un fallo
  if (!cliente) return [];
  const { data, error } = await cliente
    .from('boletos')
    .select('contenido')
    .eq('viaje_id', viajeId);
  if (error || !data) return null;
  return data.map((fila) => (fila as { contenido: BoletoGuardado }).contenido);
}
