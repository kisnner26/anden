import { AppState, type AppStateStatus } from 'react-native';

/** lo mínimo de AppState que usa el sondeo; así se puede probar sin el teléfono */
export interface FuenteDeEstado {
  addEventListener(
    tipo: 'change',
    oyente: (estado: AppStateStatus) => void,
  ): { remove(): void };
  currentState: AppStateStatus | string | null | undefined;
}

/**
 * repite una tarea cada cierto tiempo solo mientras la app está a la vista: en segundo plano no gasta
 * batería ni datos, y al volver la hace al instante para no mostrar algo viejo. Devuelve cómo pararlo.
 */
export function iniciarSondeo(
  tarea: () => void,
  cadaMs: number,
  fuente: FuenteDeEstado = AppState,
): () => void {
  let temporizador: ReturnType<typeof setInterval> | null = null;
  const arrancar = () => {
    if (temporizador === null) temporizador = setInterval(tarea, cadaMs);
  };
  const parar = () => {
    if (temporizador !== null) clearInterval(temporizador);
    temporizador = null;
  };
  if (fuente.currentState === 'active') arrancar();
  const suscripcion = fuente.addEventListener('change', (estado) => {
    if (estado === 'active') {
      if (temporizador === null) {
        tarea();
        arrancar();
      }
    } else {
      parar();
    }
  });
  return () => {
    parar();
    suscripcion.remove();
  };
}
