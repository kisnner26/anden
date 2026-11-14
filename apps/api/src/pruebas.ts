import { construirApp } from './app';
import type { Salida } from './esquemas/salida';
import { crearRepositorioEnMemoria } from './repositorios/salidas';

/** una salida de muestra para las pruebas, con lo que se indique cambiado */
export function salidaDePrueba(cambios: Partial<Salida> = {}): Salida {
  return {
    asientosLibres: 12,
    destino: 'Boaco',
    estado: 'programado',
    id: 'via_a',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 123-456',
    puntoEncuentro: '764M4PPX+HH',
    salida: '2026-11-15T12:00:00.000Z',
    servicio: 'ordinario',
    tarifa: 70,
    ventaAbierta: true,
    ...cambios,
  };
}

/** la app lista para probar: sin registros y con un repositorio en memoria */
export async function appDePrueba(
  salidas: Salida[],
  peticionesPorMinuto = 1000,
) {
  return construirApp({
    configuracion: {
      NIVEL_DE_REGISTRO: 'silent',
      NODE_ENV: 'test',
      PETICIONES_POR_MINUTO: peticionesPorMinuto,
    },
    salidas: crearRepositorioEnMemoria(salidas),
  });
}
