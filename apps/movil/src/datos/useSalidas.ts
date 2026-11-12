import { useEffect, useMemo, useState } from 'react';

import { crearMuestra, type DatosMuestra } from './muestra';
import {
  armarSalidas,
  armarTodasLasSalidas,
  proximaSalida,
  salidasDelDia,
} from './salidas';

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

/**
 * las salidas de una terminal (o de todas si no se indica) con la hora actual refrescada.
 * Sin `dia` trae todos los días reservables, que es lo que necesita quien busca un viaje por su id;
 * con `dia` trae solo las de ese día, para las listas.
 */
export function useSalidas(origenId?: string, dia?: Date) {
  const ahora = useAhora();
  const datos = obtenerMuestra();
  const todas = useMemo(
    () =>
      origenId
        ? armarSalidas(datos, ahora, origenId)
        : armarTodasLasSalidas(datos, ahora),
    [datos, ahora, origenId],
  );
  const marcaDia = dia?.getTime();
  const salidas = useMemo(
    () =>
      marcaDia === undefined ? todas : salidasDelDia(todas, new Date(marcaDia)),
    [marcaDia, todas],
  );
  const proxima = useMemo(() => proximaSalida(todas), [todas]);
  return { ahora, datos, proxima, salidas };
}
