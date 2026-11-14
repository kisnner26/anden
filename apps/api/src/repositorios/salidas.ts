import type { FiltroSalidas, Salida } from '../esquemas/salida';

/**
 * lo que la API necesita saber de dónde salen las salidas. La implementación real habla con Supabase; las
 * rutas solo conocen esta interfaz, así se puede probar sin base de datos y cambiar de almacenamiento.
 */
export interface RepositorioSalidas {
  listar(filtro: FiltroSalidas): Promise<Salida[]>;
  obtener(id: string): Promise<Salida | null>;
}

function mismoDia(iso: string, dia: string): boolean {
  return iso.slice(0, 10) === dia;
}

/** un repositorio en memoria: sirve para las pruebas y para desarrollar sin conexión */
export function crearRepositorioEnMemoria(
  salidas: readonly Salida[],
): RepositorioSalidas {
  return {
    async listar(filtro) {
      return salidas
        .filter(
          (s) =>
            (!filtro.origen || s.origen === filtro.origen) &&
            (!filtro.destino || s.destino === filtro.destino) &&
            (!filtro.servicio || s.servicio === filtro.servicio) &&
            (!filtro.dia || mismoDia(s.salida, filtro.dia)),
        )
        .sort((a, b) => a.salida.localeCompare(b.salida));
    },
    async obtener(id) {
      return salidas.find((s) => s.id === id) ?? null;
    },
  };
}
