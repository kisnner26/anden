import { asientosDe, PLANOS, type ConfiguracionBus } from '@anden/dominio';

import { rumboGrados, type Coordenada } from './geometria';
import { ladoDelSol, type LadoDelSol } from './sol';

/**
 * de qué lado del bus pega el sol durante el viaje: se mira al salir y un par de veces más por el camino, y gana el
 * lado que más veces lo recibe; si casi siempre da de frente, de espaldas o de noche, no hay un lado peor que otro
 */
export function ladoDelSolEnViaje(
  salida: Date,
  origen: Coordenada,
  destino: Coordenada,
  duracionMin = 120,
): LadoDelSol {
  const rumbo = rumboGrados(origen, destino);
  const cuentas = { derecha: 0, izquierda: 0, ninguno: 0 };
  for (const fraccion of [0, 0.5, 1]) {
    const momento = new Date(
      salida.getTime() + fraccion * duracionMin * 60_000,
    );
    cuentas[ladoDelSol(momento, origen, rumbo)] += 1;
  }
  if (cuentas.derecha > cuentas.izquierda && cuentas.derecha >= 2)
    return 'derecha';
  if (cuentas.izquierda > cuentas.derecha && cuentas.izquierda >= 2) {
    return 'izquierda';
  }
  return 'ninguno';
}

/** los asientos de un lado del bus mirando al frente; los del centro de una fila de cinco no son de ningún lado */
export function asientosDelLado(
  configuracion: ConfiguracionBus,
  lado: 'derecha' | 'izquierda',
): number[] {
  const columnas = PLANOS[configuracion][0]?.length ?? 0;
  const centro = (columnas - 1) / 2;
  return asientosDe(configuracion)
    .filter((a) =>
      lado === 'izquierda' ? a.columna < centro : a.columna > centro,
    )
    .map((a) => a.numero);
}
