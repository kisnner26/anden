import { precioOficial, type TipoServicio } from '@anden/dominio';

import type { DatosMuestra } from './muestra';
import { armarSalidas } from './salidas';

export interface ServicioDeRuta {
  servicio: TipoServicio;
  /** córdobas por pasajero; nulo si la ruta no tiene tarifa cargada para ese servicio */
  tarifa: number | null;
}

export interface RutaVista {
  destino: string;
  distanciaKm: number;
  duracionMin: number;
  id: string;
  proximaSalida: Date | null;
  salidasPendientes: number;
  servicios: ServicioDeRuta[];
}

const SERVICIOS_EN_ORDEN: TipoServicio[] = [
  'ordinario',
  'expreso',
  'taxi-interlocal',
];

/** las rutas de la terminal con los servicios que las recorren, su tarifa de muestra y la próxima salida */
export function armarRutas(datos: DatosMuestra, ahora: Date): RutaVista[] {
  const salidas = armarSalidas(datos, ahora);

  return datos.rutas
    .filter((ruta) => ruta.origenId === 'ter_may')
    .map((ruta) => {
      const destino = datos.terminales.find(
        (terminal) => terminal.id === ruta.destinoId,
      );
      const delRuta = salidas.filter((salida) => salida.rutaId === ruta.id);
      const pendientes = delRuta.filter(
        (salida) =>
          salida.salida.getTime() + salida.minutosAtraso * 60_000 >=
          ahora.getTime(),
      );
      const servicios = SERVICIOS_EN_ORDEN.filter((servicio) =>
        delRuta.some((salida) => salida.servicio === servicio),
      ).map<ServicioDeRuta>((servicio) => {
        const precio = precioOficial(
          datos.tarifario,
          ruta.id,
          servicio,
          { desde: 0, hasta: ruta.paradas.length - 1 },
          [{ esMenorEnBrazos: false, nombre: 'pasajero' }],
        );
        return { servicio, tarifa: precio.ok ? precio.valor.unitario : null };
      });

      return {
        destino: destino?.ciudad ?? '',
        distanciaKm: ruta.distanciaKm,
        duracionMin: ruta.duracionMin,
        id: ruta.id,
        proximaSalida: pendientes[0]?.salida ?? null,
        salidasPendientes: pendientes.length,
        servicios,
      };
    });
}
