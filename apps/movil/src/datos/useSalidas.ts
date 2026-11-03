import { useEffect, useMemo, useState } from 'react';

import { crearMuestra, type DatosMuestra } from './muestra';
import { armarSalidas, proximaSalida } from './salidas';

const MEDIO_MINUTO = 30_000;

let muestra: DatosMuestra | null = null;

/** la muestra se crea una sola vez por sesión para que todas las pantallas vean las mismas salidas */
export function obtenerMuestra(): DatosMuestra {
  muestra ??= crearMuestra(new Date());
  return muestra;
}

/** reinicia la muestra; solo lo usan las pruebas */
export function reiniciarMuestra(): void {
  muestra = null;
}

/** la hora actual, refrescada cada medio minuto */
export function useAhora(intervalo: number = MEDIO_MINUTO): Date {
  const [ahora, establecerAhora] = useState(() => new Date());
  useEffect(() => {
    const temporizador = setInterval(
      () => establecerAhora(new Date()),
      intervalo,
    );
    return () => clearInterval(temporizador);
  }, [intervalo]);
  return ahora;
}

export function useSalidas(origenId: string = 'ter_uca') {
  const ahora = useAhora();
  const datos = obtenerMuestra();
  const salidas = useMemo(
    () =>
      armarSalidas(datos, ahora).filter((salida) => {
        const ruta = datos.rutas.find(
          (candidata) => candidata.id === salida.rutaId,
        );
        return ruta?.origenId === origenId;
      }),
    [datos, ahora, origenId],
  );
  const proxima = useMemo(() => proximaSalida(salidas), [salidas]);
  return { ahora, datos, proxima, salidas };
}
